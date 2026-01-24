interface Window {
  // poi runtime globals (used when Simulator2 is constructed with { usePoiAPI: true })
  $ships?: Record<
    number,
    {
      api_houg: [number]
      api_raig: [number]
      api_tyku: [number]
      api_souk: [number]
    }
  >
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
