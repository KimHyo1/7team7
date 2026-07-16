// Simple travel score algorithm
// Input: { temp, weather, rain }
// Output: { score: 0-100, grade: '좋음'|'보통'|'나쁨', message }

export function calculateTravelScore({ temp, weather, rain }) {
  let score = 50

  if (typeof temp === 'number') {
    if (temp >= 20 && temp <= 28) score += 20
    else if (temp >= 15 && temp < 20) score += 10
    else if (temp > 28 && temp <= 32) score += 5
    else score -= 10
  }

  const w = (weather || '').toLowerCase()
  if (w.includes('clear') || w.includes('맑')) score += 15
  else if (w.includes('cloud') || w.includes('흐')) score += 5
  else if (w.includes('rain') || w.includes('비') || w.includes('drizzle')) score -= 20
  else if (w.includes('snow') || w.includes('눈')) score -= 5

  if (typeof rain === 'number') {
    if (rain > 0) score -= Math.min(30, rain * 10)
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let grade = '보통'
  let message = '적절한 여행 일정입니다.'
  if (score >= 75) { grade = '좋음'; message = '여행하기 아주 좋은 날이에요! 가벼운 외출을 추천합니다.' }
  else if (score >= 50) { grade = '보통'; message = '무난한 날씨입니다. 활동 계획은 여유 있게.' }
  else { grade = '나쁨'; message = '비나 강한 날씨가 예상됩니다. 실내 중심 일정을 고려하세요.' }

  return { score, grade, message }
}

export default { calculateTravelScore }
