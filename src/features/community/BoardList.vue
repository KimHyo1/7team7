<template>
  <div class="community-page">
    <div class="controls">
      <div class="header-row">
        <div class="head-left">
          <div class="title-wrap">
            <span class="icon">🏘️</span>
            <div>
              <h2 class="main-title">익명 커뮤니티</h2>
              <div class="subtitle">우리 동네 정보를 자유롭게 공유하는 공간입니다.</div>
            </div>
          </div>
        </div>
        <!-- Right write button removed per request -->
      </div>

      <div class="search-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="localQuery" placeholder="게시글 검색" class="search" />
        </div>
        <select v-model="region" class="region-select">
          <option value="all">전체 구미시</option>
          <option value="원평동">원평동</option>
          <option value="송정동">송정동</option>
          <option value="인동">인동</option>
          <option value="선산읍">선산읍</option>
        </select>
      </div>

      <div class="categories">
        <button v-for="c in categoriesList" :key="c" :class="['cat-btn', { active: activeCategory===c } ]" @click="selectCategory(c)">{{ c }}</button>
      </div>
    </div>

    <div class="layout">
      <main class="list-area">
        <div class="cards">
          <component
            v-for="post in filteredPosts"
            :is="(['맛집','여행후기'].includes(post.category) ? ImagePostCard : PostCard)"
            :key="post.id"
            :post="post"
            @view="() => selectPost(post)"
            @edit="$emit('edit-post', post)"
            @delete="$emit('delete-post', post)"
            @like="$emit('like-post', post)"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import foodJson from '../../data/구미_경북권_음식점.json'
import attractionJson from '../../data/구미_경북권_관광지.json'
import cultureJson from '../../data/구미_경북권_문화시설.json'
import lodgingJson from '../../data/구미_경북권_숙박.json'
import shoppingJson from '../../data/구미_경북권_쇼핑.json'
import PostCard from '../../components/PostCard.vue'
import ImagePostCard from '../../components/ImagePostCard.vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  categories: { type: Array, default: () => ['전체','맛집','여행후기','지역정보','질문'] },
  currentCategory: { type: String, default: '전체' },
  searchQuery: { type: String, default: '' }
})
const emit = defineEmits(['select-post','open-form','edit-post','delete-post','like-post','change-category','update-search','update-sort'])

const localQuery = ref(props.searchQuery || '')
const region = ref('all')
const activeCategory = ref(props.currentCategory || '전체')
const categoriesList = props.categories

// demo fallback posts (expanded so many posts appear)
const demoPosts = ref([
  { id:1, category:'맛집', title:'구미 현지인이 추천하는 맛집', content:'금오산 근처에서 가볍게 들르기 좋은 한식집입니다.', author:'익명_123', createdAt:'2026-07-10', views:234, likes:132, comments:[{id:1}], location:'금오산 근처', aiScore:92, visitors:24, thumbnail:'/assets/community/food1.svg' },
  { id:2, category:'여행후기', title:'금오산 등산 후기', content:'아름다운 경치와 쉬운 코스, 추천합니다.', author:'등산러', createdAt:'2026-06-30', views:198, likes:98, comments:[], location:'금오산', aiScore:88, visitors:52, thumbnail:'/assets/community/trail.svg' },
  { id:3, category:'맛집', title:'숨은 분식집 추천', content:'동네에서 가성비 좋은 분식집을 찾았습니다.', author:'익명_999', createdAt:'2026-06-28', views:120, likes:54, comments:[], location:'원평동', aiScore:78, visitors:15, thumbnail:'/assets/community/streetfood.svg' },
  { id:4, category:'지역정보', title:'주차 가능한 공용 주차장', content:'금오산 공용 주차장 위치와 요금 정보', author:'정보봇', createdAt:'2026-07-01', views:150, likes:76, comments:[], location:'구미시', aiScore:74, visitors:18, thumbnail:'/assets/community/parking.svg' },
  { id:5, category:'여행후기', title:'강변 산책로 후기', content:'아이와 함께 걷기 좋은 코스입니다.', author:'가족여행러', createdAt:'2026-07-03', views:95, likes:32, comments:[], location:'송정동', aiScore:83, visitors:22, thumbnail:'/assets/community/river.svg' },
  { id:6, category:'질문', title:'주말에 혼잡한가요?', content:'금오산 주차 및 혼잡도 관련 질문입니다.', author:'익명_007', createdAt:'2026-07-05', views:60, likes:12, comments:[], location:'금오산', aiScore:66, visitors:8, thumbnail:'/assets/community/crowd.svg' },
  { id:7, category:'맛집', title:'선산 숨은 맛집 리스트', content:'선산지역의 인기 맛집 정리', author:'현지인', createdAt:'2026-07-02', views:300, likes:54, comments:[], location:'선산읍', aiScore:70, visitors:30, thumbnail:'/assets/community/local.svg' },
  { id:8, category:'맛집', title:'레트로 감성 카페', content:'아기자기한 인테리어의 감성 카페입니다.', author:'카페러', createdAt:'2026-06-20', views:88, likes:44, comments:[], location:'인동', aiScore:79, visitors:19, thumbnail:'/assets/community/cafe.svg' }
])

const sourcePosts = computed(() => {
  const existing = (props.posts && props.posts.length) ? props.posts.slice() : []

  function makeThumb(post) {
    if (post.thumbnail) return post.thumbnail
    const cat = (post.category || '').toLowerCase()
    const loc = (post.location || '').toLowerCase()
    // try find matching place image from local datasets
    function findPlaceImage(){
      const lists = [foodJson.items||[], attractionJson.items||[], cultureJson.items||[], lodgingJson.items||[], shoppingJson.items||[]]
      for(const list of lists){
        for(const it of list){
          const title = String(it.title||'').toLowerCase()
          const addr = String(it.addr1||'').toLowerCase()
          if(loc && (title.includes(loc) || addr.includes(loc))) return it.firstimage || it.firstimage2 || ''
          if(post.title && title && post.title.toLowerCase().includes(title.split(' ')[0])) return it.firstimage || it.firstimage2 || ''
        }
      }
      return ''
    }
    const found = findPlaceImage()
    if(found) return found
    if (cat.includes('맛집') || cat.includes('food') ) return `https://source.unsplash.com/600x400/?korean-food,restaurant,${encodeURIComponent(loc||'gumi')}`
    if (cat.includes('여행') || cat.includes('travel') || cat.includes('등산')) return `https://source.unsplash.com/600x400/?${encodeURIComponent(loc||'mountain')},hiking,scenery`
    if (cat.includes('카페') || cat.includes('cafe')) return `https://source.unsplash.com/600x400/?cafe,coffee`
    if (cat.includes('지역') || cat.includes('정보')) return `https://source.unsplash.com/600x400/?${encodeURIComponent(loc||'gumi')},city`
    return `https://source.unsplash.com/600x400/?${encodeURIComponent(loc||'gumi')},place`
  }

  // ensure every existing post has a thumbnail (generate if missing)
  function computeAiScoreLocal(post){
    const text = ((post.title||'') + ' ' + (post.content||'')).toLowerCase()
    const cat = (post.category||'').toLowerCase()
    let score = 30
    const keywords = {
      맛집:['맛집','한식','카페','분식','디저트','식당','음식'],
      여행후기:['등산','후기','여행','산책','관광','코스','경치'],
      지역정보:['주차','정보','행사','축제','공용','안내','소식'],
      질문:['문의','질문','추천','혼잡','가능'],
      자유:[]
    }
    const ks = keywords[post.category] || keywords[cat] || []
    ks.forEach(k=>{ if(text.includes(k)) score+=15 })
    if(text.length>80) score +=10
    if(text.includes('추천')) score +=10
    return Math.min(95, score)
  }

  const normalized = existing.map(p => ({ ...p, thumbnail: p.thumbnail || makeThumb(p), aiScore: p.aiScore || computeAiScoreLocal(p) }))

  // if not enough posts, append demo posts (skipping duplicates)
  if (normalized.length >= 6) return normalized
  const extra = demoPosts.value.filter(dp => !normalized.find(e => e.id === dp.id)).map(p => ({ ...p }))
  // make sure extras also have thumbnails
  const extrasWithThumbs = extra.map(p => ({ ...p, thumbnail: p.thumbnail || makeThumb(p) }))
  return [...normalized, ...extrasWithThumbs]
})

watch(localQuery, (v) => emit('update-search', v))
watch(() => props.searchQuery, (v) => { if(v !== localQuery.value) localQuery.value = v })

function selectCategory(c){ activeCategory.value = c; emit('change-category', c) }
function selectPost(post){ emit('select-post', post); }

const filteredPosts = computed(()=>{
  return sourcePosts.value.filter(p=>{
    if(region.value !== 'all' && p.location && !p.location.includes(region.value)) return false
    if(activeCategory.value !== '전체' && p.category !== activeCategory.value) return false
    if(localQuery.value && !(p.title+" "+p.content).toLowerCase().includes(localQuery.value.toLowerCase())) return false
    return true
  })
})
</script>

<style scoped>
.community-page { display:flex; flex-direction:column; gap:18px; }
.controls { display:flex; flex-direction:column; gap:12px }
.header-row { display:flex; justify-content:space-between; align-items:center }
.title-wrap { display:flex; gap:12px; align-items:center }
.main-title { margin:0; font-size:1.25rem; color:#18344f }
.subtitle { color:#6b7e8f; font-size:0.92rem }
.write-btn { background:linear-gradient(120deg,#2c7be5,#2bbd7f); color:white; border:none; padding:8px 14px; border-radius:12px; cursor:pointer }
.search-row { display:flex; gap:12px; align-items:center }
.search-box { display:flex; align-items:center; gap:8px; background:#fff; padding:6px 10px; border-radius:999px; border:1px solid #e6edf5; box-shadow: 0 6px 14px rgba(15,23,42,0.03); flex:1 }
.search-icon { color:#7d8da2 }
.search { flex:1; border:none; outline:none; padding:6px }
.region-select { padding:8px 12px; border-radius:10px; border:1px solid #dce7f4 }
.categories { display:flex; gap:8px; align-items:center; }
.cat-btn { padding:8px 12px; border-radius:999px; background:transparent; border:1px solid #dce7f4; color:#36506b; cursor:pointer }
.cat-btn.active { background:#2c7be5; color:white; border-color:transparent; font-weight:700 }
.layout { display:flex; gap:16px }
.list-area { flex:1 }
  /* show posts vertically: one card per row, full width */
  .cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cards > * {
    width: 100%;
    box-sizing: border-box;
  }
@media (max-width: 900px){ .cards { grid-template-columns: 1fr } }
@media (max-width: 900px){ .layout{flex-direction:column} .list-area{flex:1} }
</style>
