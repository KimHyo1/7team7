import attractionJson from '../data/구미_경북권_관광지.json'
import foodJson from '../data/구미_경북권_음식점.json'
import cultureJson from '../data/구미_경북권_문화시설.json'
import festivalJson from '../data/구미_경북권_축제공연행사.json'
import sportsJson from '../data/구미_경북권_레포츠.json'
import lodgingJson from '../data/구미_경북권_숙박.json'
import shoppingJson from '../data/구미_경북권_쇼핑.json'

// 도감 탭 순서와 맞춘 고정 카테고리 목록
const categories = ['관광지', '음식점', '문화시설', '축제', '레포츠', '숙박']

// contenttypeid를 사람이 읽는 카테고리로 변환
function categoryOf(typeId) {
  switch (String(typeId)) {
    case '12':
      return '관광지'
    case '39':
      return '음식점'
    case '14':
      return '문화시설'
    case '15':
      return '축제'
    case '28':
      return '레포츠'
    case '32':
      return '숙박'
    case '38':
      return '쇼핑'
    default:
      return '기타'
  }
}

// 좌표가 유효한 구미 데이터만 통과시키는 검사
function isValid(item) {
  const lng = Number(item?.mapx)
  const lat = Number(item?.mapy)
  return Number.isFinite(lng) && Number.isFinite(lat) && lng !== 0 && lat !== 0
}

// 주소나 제목에 구미가 포함되어 있는지 확인
function isGumi(item) {
  return (
    String(item?.addr1 || '').includes('구미') ||
    String(item?.title || '').includes('구미')
  )
}

// 원본 관광공사 형식을 화면 공용 형식으로 정규화
function normalize(item) {
  return {
    id: item.contentid,
    name: item.title,
    address: item.addr1 || '',
    image: item.firstimage || '',
    typeId: String(item.contenttypeid),
    category: categoryOf(item.contenttypeid),
    lat: Number(item.mapy),
    lng: Number(item.mapx),
  }
}

// 모든 원본 JSON을 한 배열로 합친 뒤 한 번만 정규화
function buildCatalog() {
  const sources = [
    attractionJson,
    foodJson,
    cultureJson,
    festivalJson,
    sportsJson,
    lodgingJson,
    shoppingJson,
  ]

  const mergedItems = []
  for (const source of sources) {
    if (Array.isArray(source?.items)) {
      mergedItems.push(...source.items)
    }
  }

  // id(contentid) 기준 중복 제거
  const seen = new Set()
  const result = []

  for (const item of mergedItems) {
    if (!isValid(item) || !isGumi(item)) continue
    if (seen.has(item.contentid)) continue

    seen.add(item.contentid)
    result.push(normalize(item))
  }

  return result
}

// 모듈 레벨에서 딱 한 번만 계산되는 카탈로그
const catalog = buildCatalog()

// id로 빠르게 찾기 위한 인덱스
const catalogById = new Map(catalog.map((place) => [place.id, place]))

// 카테고리별 묶음도 모듈 레벨에서 한 번만 계산
const catalogByCategory = categories.reduce((acc, category) => {
  acc[category] = catalog.filter((place) => place.category === category)
  return acc
}, {})

// 장소 공유 컴포저블
export function usePlaces() {
  return {
    // 정규화된 전체 장소 배열
    catalog,

    // 고정 카테고리 목록
    categories,

    // 카테고리별 장소 배열 반환
    byCategory(cat) {
      return catalogByCategory[cat] ? catalogByCategory[cat] : []
    },

    // 카테고리별 개수 반환
    countByCategory(cat) {
      return catalogByCategory[cat] ? catalogByCategory[cat].length : 0
    },

    // 전체 개수
    total: catalog.length,

    // id로 장소 하나 찾기
    findById(id) {
      return catalogById.get(id) || null
    },
  }
}