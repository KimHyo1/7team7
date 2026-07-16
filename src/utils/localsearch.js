export async function loadLocalDatasets() {
  const paths = [
    '/data/구미_경북권_관광지.json',
    '/data/구미_경북권_레포츠.json',
    '/data/구미_경북권_문화시설.json',
    '/data/구미_경북권_쇼핑.json',
    '/data/구미_경북권_숙박.json',
    '/data/구미_경북권_여행코스.json',
    '/data/구미_경북권_음식점.json',
    '/data/구미_경북권_축제공연행사.json'
  ];

const datasets = {};
  await Promise.all(
    paths.map(async (path) => {
      try {
        const res = await fetch(path);
        const data = await res.json();
        // JSON이 { items: [...] } 형태이면 내부 배열을 사용
        if (Array.isArray(data)) {
          datasets[path] = data;
        } else if (Array.isArray(data.items)) {
          datasets[path] = data.items;
        } else {
          datasets[path] = [];
        }
      } catch (error) {
        console.error('데이터 로드 실패:', path, error);
        datasets[path] = [];
      }
    })
  );

  return datasets;
}

export function retrieveRelevantSnippet(datasets, query, limit = 5) {
  // "맛집 있어?" -> ["맛집", "있어?"] 처럼 단어로 쪼갭니다.
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 0);
  const snippets = [];

  Object.values(datasets).forEach((items) => {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      const text = [
        item.name, item.title, item.description, item.overview,
        item.소개, item.address, item.주소, item.addr1, item.addr2
      ].filter(Boolean).join(' ').toLowerCase();

      // 키워드 중 하나라도 포함되어 있으면 가져옵니다! (예: "맛집" 매칭)
      const isMatch = keywords.some(kw => text.includes(kw));

      if (isMatch) {
        snippets.push({
          title: item.name || item.title || item.addr1 || '정보',
          short: (
            item.description || item.overview || item.소개 || item.addr1 || item.addr2 || ''
          ).slice(0, 100),
        });
      }

      if (snippets.length >= limit) break;
    }
  });

  // 🚨 기존에 있던 '검색결과 0개일 때 강제로 데이터 넣는 로직'을 완전히 삭제했습니다!

  return snippets
    .slice(0, limit)
    .map((item) => `- ${item.title}: ${item.short}`)
    .join('\n');
}