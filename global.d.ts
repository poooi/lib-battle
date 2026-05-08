interface Window {
  /**
   * @deprecated Pass `shipDb` directly to `Simulator2` options instead.
   */
  $ships?: Record<
    number,
    {
      api_houg: [number]
      api_raig: [number]
      api_tyku: [number]
      api_souk: [number]
    }
  >
  /**
   * @deprecated Pass `slotItemDb` directly to `Simulator2` options instead.
   */
  $slotitems?: Record<
    number,
    {
      api_houg?: number
      api_raig?: number
      api_tyku?: number
      api_souk?: number
    }
  >
}
