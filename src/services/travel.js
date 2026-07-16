export function createDefaultItinerary(places) {
  return places.slice(0, 3)
}

export function buildRecommendation(prompt, places, festivals) {
  const lowerPrompt = (prompt || '').toLowerCase()

  const matchedPlaces = places.filter((place) => {
    if (lowerPrompt.includes('산책') || lowerPrompt.includes('자연')) {
      return place.category === '자연'
    }
    if (lowerPrompt.includes('맛집') || lowerPrompt.includes('음식')) {
      return place.category === '음식'
    }
    if (lowerPrompt.includes('축제')) {
      return place.category === '축제'
    }
    return true
  })

  const selected = matchedPlaces.slice(0, 3)

  const festivalText = festivals?.length ? `현재 ${festivals.length}개 축제 일정이 등록돼 있어요.` : '축제 일정은 다음 단계에서 더 확장할 수 있어요.'

  return {
    title: 'AI 추천 코스',
    reason: '사용자의 관심사에 맞춰 자연·맛집·휴식 요소를 섞어 구성했습니다.',
    summary: `${festivalText} 오늘은 가볍게 이동하면서 사진과 식사를 즐기기 좋은 코스를 추천합니다.`,
    places: selected.length ? selected : places.slice(0, 3)
  }
}
