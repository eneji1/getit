(function () {
  // 지원할 URL 패턴 배열 (뉴스기사 URL에 포함되는 특징 문자열)
  const supportedUrlPatterns = [
    '/article/',
    '/news/',
    '/view/',
    '/read/',
    '/story/',
    '/media/',
    '/contents/',
    '/section/',
    '/articles/',
    '/reports/',
    '/breaking/'
  ];

  // 현재 URL이 지원하는 뉴스기사 URL인지 검사하는 함수
  function isSupportedNewsUrl(url) {
    return supportedUrlPatterns.some(pattern => url.includes(pattern));
  }

  if (!isSupportedNewsUrl(location.href)) return;
  if (document.getElementById('news-sidebar-container')) return;

  const sidebarStyle = `
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100vh;
    background: #f9f9f9;
    border-left: 1px solid #ddd;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    z-index: 2147483647;
    padding: 16px;
    overflow-y: auto;
    font-family: Arial, sans-serif;
    color: #333;
  `;

  function extractArticleInfo() {
    const titleEl = document.querySelector('h1');
    const title = titleEl ? titleEl.innerText.trim() : null;

    // 본문 추출을 시도할 여러 선택자 배열 (언론사별로 다를 수 있음)
    const bodySelectors = [
      'article p',
      '.article-content p',
      '.news-content p',
      '.article-body p',
      '.content p',
      '.story-content p',
      '.news_article p',
      '.text p',
      '.news_text p',
      '.article_text p'
    ];

    let fullText = '';
    for (const sel of bodySelectors) {
      const paras = Array.from(document.querySelectorAll(sel));
      if (paras.length > 0) {
        fullText = paras.map(p => p.innerText.trim()).filter(t => t.length > 0).join(' ');
        if (fullText) break;
      }
    }

    // 본문 못 찾았으면 기본 p 태그 중 앞 5개 문단 가져오기
    if (!fullText) {
      const pAll = Array.from(document.querySelectorAll('p'));
      fullText = pAll.slice(0, 5).map(p => p.innerText.trim()).join(' ');
    }

    // 기자명 추출 시도할 선택자 배열
    const reporterSelectors = [
      '[class*=reporter]',
      '.byline',
      '.author',
      '.writer',
      '.journalist',
      '.reporter-name',
      '.name',
      '.writer-name'
    ];

    let reporter = null;
    for (const sel of reporterSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim()) {
        reporter = el.innerText.trim();
        break;
      }
    }

    return { title, fullText, reporter };
  }

  function generateSummary(text) {
    if (!text) return '요약할 내용이 없습니다.';
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    const summary = sentences.slice(0, 3).join(' ');
    return summary.length > 300 ? summary.slice(0, 300) + '...' : summary;
  }

  function renderPoliticalBiasBar(container, leftPercent, rightPercent) {
    const total = leftPercent + rightPercent;
    const leftRatio = (leftPercent / total) * 100;
    const rightRatio = (rightPercent / total) * 100;

    const biasHTML = `
      <h3 style="font-size:15px; margin-top:20px;">정치 성향 분석</h3>
      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
        <span style="color:#0072c6;">좌파 ${leftPercent}%</span>
        <span style="color:#d9534f;">우파 ${rightPercent}%</span>
      </div>
      <div style="width:100%; height:18px; background:#eee; border-radius:9px; overflow:hidden;">
        <div style="width:${leftRatio}%; height:100%; background:#0072c6; float:left;"></div>
        <div style="width:${rightRatio}%; height:100%; background:#d9534f; float:left;"></div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', biasHTML);
  }

  function createSidebar(title, summary, reporter, fullText, politicalBias) {
    const sidebar = document.createElement('aside');
    sidebar.id = 'news-sidebar-container';
    sidebar.style.cssText = sidebarStyle;

    sidebar.innerHTML = `
      <h2 style="font-size:20px; margin-top:0;">${title || '제목 없음'}</h2>
      ${reporter ? `<p style="font-size:13px; color:#666;">🖋️ ${reporter}</p>` : ''}
      <h3 style="font-size:16px; margin-top:20px;">요약</h3>
      <p style="line-height:1.5; font-size:14px;">${summary}</p>
      <hr />
      <h3 style="font-size:15px; margin-top:20px;">본문 전체</h3>
      <p style="line-height:1.5; font-size:13px;">${fullText}</p>
      <div id="bias-bar-container" style="margin-top:20px;"></div>
      <button id="news-sidebar-close" style="
        position: absolute; 
        top: 8px; 
        right: 8px; 
        background: transparent; 
        border: none; 
        font-size: 18px; 
        cursor: pointer;
        color: #666;">×</button>
    `;

    document.body.appendChild(sidebar);

    sidebar.querySelector('#news-sidebar-close').addEventListener('click', () => {
      sidebar.remove();
    });

    if (politicalBias && typeof politicalBias.left === 'number' && typeof politicalBias.right === 'number') {
      const biasContainer = document.getElementById('bias-bar-container');
      renderPoliticalBiasBar(biasContainer, politicalBias.left, politicalBias.right);
    }
  }

  // 실행
  const { title, fullText, reporter } = extractArticleInfo();
  const summary = generateSummary(fullText);

  // 임의 정치 성향 비율 예시
  const politicalBias = {
    left: 65,
    right: 35
  };

  createSidebar(title, summary, reporter, fullText, politicalBias);
})();
