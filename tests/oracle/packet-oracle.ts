export type Side = "friend" | "enemy" | "friendEscort" | "enemyEscort" | "friendSupport"

export type OracleAttack = {
  from: { side: Side; index: number }
  to: { side: Side; index: number }
  damage: number[]
  cl: number[]
}

export type OraclePhase = {
  kind: "opening_torpedo" | "closing_torpedo" | "shelling" | "night_shelling" | "friendly_shelling"
  attacks: OracleAttack[]
}

function isNumberArray(x: unknown): x is number[] {
  return Array.isArray(x) && x.every(v => typeof v === "number")
}

function asNumberArray(x: unknown): number[] {
  return isNumberArray(x) ? x : []
}

function normalizeDamageList(x: unknown): number[] {
  if (!Array.isArray(x)) return []
  const out: number[] = []
  for (const v of x) {
    if (typeof v !== "number") continue
    // KanColle API can contain -1 sentinels. In the simulator we ignore them.
    if (v < 0) continue
    out.push(Math.floor(v))
  }
  return out
}

function normalizeClList(x: unknown, len: number): number[] {
  const out = normalizeDamageList(x)
  if (out.length === len) return out
  // Pad to match damage entries so the comparison is stable.
  while (out.length < len) out.push(0)
  return out.slice(0, len)
}

function flattenTargets(df: unknown): number[] {
  // api_df_list is a list of lists.
  // Each inner list usually has a single target index, but can include multiple.
  if (!Array.isArray(df)) return []
  const out: number[] = []
  for (const inner of df) {
    if (!Array.isArray(inner)) continue
    for (const v of inner) if (typeof v === "number") out.push(v)
  }
  return out
}

function zipTargetsDamageCl(targets: number[], damage: unknown, cl: unknown) {
  const damageList = Array.isArray(damage) ? damage : []
  const clList = Array.isArray(cl) ? cl : []
  const out: Array<{ target: number; damage: number[]; cl: number[] }> = []

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    const d = normalizeDamageList(damageList[i])
    const c = normalizeClList(clList[i], d.length)
    out.push({ target: t, damage: d, cl: c })
  }
  return out
}

export function oracleOpeningTorpedo(packet: any): OraclePhase | null {
  // KanColle API arrays are 0-based but include a sentinel at index 0 in practice.
  // For stable comparison against the simulator, accept fleet lengths and filter
  // invalid indices/targets.
  return oracleOpeningTorpedoWithLens(packet)
}

export function oracleOpeningTorpedoWithLens(
  packet: any,
  lens: { friendLen?: number; enemyLen?: number } = {},
): OraclePhase | null {
  const raigeki = packet?.api_opening_atack
  if (!raigeki) return null

  const frai = asNumberArray(raigeki.api_frai)
  const erai = asNumberArray(raigeki.api_erai)
  const fydam = asNumberArray(raigeki.api_fydam ?? raigeki.api_fdam)
  const eydam = asNumberArray(raigeki.api_eydam ?? raigeki.api_edam)
  const fcl = asNumberArray(raigeki.api_fcl)
  const ecl = asNumberArray(raigeki.api_ecl)

  const attacks: OracleAttack[] = []

  // Friend -> Enemy
  for (let i = 0; i < frai.length; i++) {
    const t = frai[i]
    if (typeof t !== "number" || t < 0) continue
    // Target indices include 0 in real captures; the simulator currently
    // produces attacks with `toShip: null` for these entries.
    if (lens.friendLen != null && i >= lens.friendLen) continue
    if (lens.enemyLen != null && t >= lens.enemyLen) continue
    const damage = typeof fydam[i] === "number" ? [Math.floor(fydam[i])] : []
    const clv = typeof fcl[i] === "number" ? [Math.floor(fcl[i])] : []
    attacks.push({
      from: { side: "friend", index: i },
      to: { side: "enemy", index: t },
      damage,
      cl: clv,
    })
  }

  // Enemy -> Friend
  for (let i = 0; i < erai.length; i++) {
    const t = erai[i]
    if (typeof t !== "number" || t < 0) continue
    // Friendly fleets are 0-based in most API lists.
    if (lens.enemyLen != null && i >= lens.enemyLen) continue
    if (lens.friendLen != null && t >= lens.friendLen) continue
    const damage = typeof eydam[i] === "number" ? [Math.floor(eydam[i])] : []
    const clv = typeof ecl[i] === "number" ? [Math.floor(ecl[i])] : []
    attacks.push({
      from: { side: "enemy", index: i },
      to: { side: "friend", index: t },
      damage,
      cl: clv,
    })
  }

  return { kind: "opening_torpedo", attacks }
}

export function oracleNightHougekiFriend(packet: any, lens: { mainFleetLen: number }): OracleAttack[] {
  const hougeki = packet?.api_hougeki
  if (!hougeki) return []

  const atList = asNumberArray(hougeki.api_at_list)
  const dfList = Array.isArray(hougeki.api_df_list) ? hougeki.api_df_list : []
  const damage = Array.isArray(hougeki.api_damage) ? hougeki.api_damage : []
  const clList = Array.isArray(hougeki.api_cl_list) ? hougeki.api_cl_list : []

  const attacks: OracleAttack[] = []

  for (let i = 0; i < atList.length; i++) {
    const attacker = atList[i]
    if (typeof attacker !== "number" || attacker < 0) continue

    const df = dfList[i]
    if (!Array.isArray(df) || df.length === 0) continue
    const df0 = df.find((x: any) => typeof x === "number" && x >= 0)
    if (typeof df0 !== "number") continue

    // In api_hougeki without api_at_eflag, the simulator infers direction from df.
    // We only validate our-side attacks here.
    const mainFleetRange = lens.mainFleetLen
    const fromEnemy = df0 < mainFleetRange
    if (fromEnemy) continue

    // Match simulator's normalization when api_at_eflag is missing.
    let at = attacker
    let dfN = df0
    if (at >= mainFleetRange) at -= mainFleetRange
    if (dfN >= mainFleetRange) dfN -= mainFleetRange

    const to = dfN
    if (to < 0) continue
    const dmg = normalizeDamageList(damage[i])
    const clv = normalizeClList(clList[i], dmg.length)
    attacks.push({
      from: { side: "friend", index: at },
      to: { side: "enemy", index: to },
      damage: dmg,
      cl: clv,
    })
  }

  return attacks
}

export function oracleShelling(packet: any, key: string): OraclePhase | null {
  const hougeki = packet?.[key]
  if (!hougeki) return null

  const atList = asNumberArray(hougeki.api_at_list)
  const dfList = Array.isArray(hougeki.api_df_list) ? hougeki.api_df_list : []
  const damage = Array.isArray(hougeki.api_damage) ? hougeki.api_damage : []
  const clList = Array.isArray(hougeki.api_cl_list) ? hougeki.api_cl_list : []

  const attacks: OracleAttack[] = []

  for (let i = 0; i < atList.length; i++) {
    const attacker = atList[i]
    if (typeof attacker !== "number" || attacker < 0) continue

    const df = dfList[i]
    let targets: number[] = []
    if (typeof df === "number") {
      if (df >= 0) targets = [df]
    } else if (Array.isArray(df)) {
      targets = df.filter((x: any) => typeof x === "number" && x >= 0)
    }
    if (targets.length === 0) continue

    const dmgEntry = damage[i]
    const clEntry = clList[i]

    const uniqueTargets = Array.from(new Set(targets))
    if (uniqueTargets.length === 1) {
      const d = normalizeDamageList(dmgEntry)
      const c = normalizeClList(clEntry, d.length)
      attacks.push({
        from: { side: "friend", index: attacker },
        to: { side: "enemy", index: uniqueTargets[0] },
        damage: d,
        cl: c,
      })
      continue
    }

    // Multi-target: assume one hit per target index.
    for (let j = 0; j < targets.length; j++) {
      const t = targets[j]
      if (t < 0) continue
      const dmg = Array.isArray(dmgEntry) && typeof dmgEntry[j] === "number" ? [Math.floor(dmgEntry[j])] : []
      const clv = Array.isArray(clEntry) && typeof clEntry[j] === "number" ? [Math.floor(clEntry[j])] : []
      attacks.push({
        from: { side: "friend", index: attacker },
        to: { side: "enemy", index: t },
        damage: dmg,
        cl: clv,
      })
    }
  }

  return { kind: key === "api_hougeki" ? "night_shelling" : "shelling", attacks }
}

export function oracleFriendlyNightShelling(packet: any): OraclePhase | null {
  const hougeki = packet?.api_friendly_battle?.api_hougeki
  if (!hougeki) return null

  const atList = asNumberArray(hougeki.api_at_list)
  const dfList = Array.isArray(hougeki.api_df_list) ? hougeki.api_df_list : []
  const damage = Array.isArray(hougeki.api_damage) ? hougeki.api_damage : []
  const clList = Array.isArray(hougeki.api_cl_list) ? hougeki.api_cl_list : []

  const attacks: OracleAttack[] = []
  for (let i = 0; i < atList.length; i++) {
    const attacker = atList[i]
    if (typeof attacker !== "number" || attacker < 0) continue

    const targets = flattenTargets(dfList[i])
    const perTarget = zipTargetsDamageCl(targets, damage[i], clList[i])
    for (const t of perTarget) {
      if (t.target < 0) continue
      attacks.push({
        from: { side: "friendSupport", index: attacker },
        to: { side: "enemy", index: t.target },
        damage: t.damage,
        cl: t.cl,
      })
    }
  }

  return { kind: "friendly_shelling", attacks }
}
