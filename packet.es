
export class Battle {
  constructor(opts) {
    this.version = opts.version ? opts.version : "2.1"
    this.type    = opts.type    // BattleType
    this.map     = opts.map     // [int, int, int] : 2-3-1
    this.desc    = opts.desc    // Description
    this.time    = opts.time    // Seconds since epoch time. Must be same as the first packet.
    this.fleet   = opts.fleet   // [api_port/port.api_ship[], ...] (Extended)
    this.packet  = opts.packet  // [Packet, ...] : Order by time
  }
}

export const BattleType = {
  Normal  : "Normal",
  Boss    : "Boss",
  Practice: "Pratice",
}

export class Fleet {
  constructor(opts) {
    this.type    = opts.type     // api_port/port.api_combined_flag
    this.main    = opts.main     // api_get_member/deck[].api_ship (Extended)
    this.escort  = opts.escort   // ^^
    this.support = opts.support  // ^^
    this.LBAC    = opts.LBAC     // api_get_member/base_air_corps (Extended)
  }
}
