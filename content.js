(function () {
  const validUrlPatterns = [
    '/article/', '/news/', '/view/', '/read/', '/articles/', '/story/', '/media/', '/contents/'
  ];
  if (!validUrlPatterns.some(pattern => location.href.includes(pattern))) return;
  if (document.getElementById('news-sidebar-container')) return;

  const sidebarStyle = `
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    height: 100vh;
    background: #FFF5E1;
    border-left: 3px solid #800020;
    box-shadow: -3px 0 10px rgba(128,0,32,0.3);
    z-index: 2147483647;
    padding: 24px 20px 20px 20px;
    overflow-y: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #4B2C2C;
    display: flex;
    flex-direction: column;
  `;

  function extractArticleInfo() {
    const titleEl = document.querySelector('h1');
    const title = titleEl ? titleEl.innerText.trim() : null;

    const reporterEl = document.querySelector('.reporter, .byline, .author, .journalist');
    const reporter = reporterEl ? reporterEl.innerText.trim() : null;

    const paragraphs = Array.from(document.querySelectorAll('article p, .article-content p, .news-content p'));
    let fullText = paragraphs.map(p => p.innerText.trim()).filter(t => t.length > 0).join(' ');
    if (!fullText) {
      const pAll = Array.from(document.querySelectorAll('p'));
      fullText = pAll.slice(0, 5).map(p => p.innerText.trim()).join(' ');
    }

    return { title, reporter, fullText };
  }

  function generateSummary(text) {
    if (!text) return '요약할 내용이 없습니다.';
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    const summary = sentences.slice(0, 3).join(' ');
    return summary.length > 300 ? summary.slice(0, 300) + '...' : summary;
  }

  // 좌(파랑), 우(빨강) 색깔 막대바 렌더링
  function renderPoliticalBiasBar(container, leftPercent, rightPercent) {
    container.style.marginTop = '16px';

    container.innerHTML = `
      <div style="font-weight:bold; margin-bottom:6px;">정치 성향 분석</div>
      <div style="display:flex; align-items:center; gap:8px; font-size:14px; color:#4B2C2C;">
        <span>좌</span>
        <div style="flex:1; background:#d6e1f4; border-radius:12px; height:18px; overflow:hidden; box-shadow: inset 0 0 5px rgba(0,0,0,0.1);">
          <div style="height:100%; width:${leftPercent}%; background:#0047AB; border-radius:12px 0 0 12px; transition: width 0.5s;"></div>
        </div>
        <span>우</span>
        <div style="flex:1; background:#f4d6d6; border-radius:12px; height:18px; overflow:hidden; box-shadow: inset 0 0 5px rgba(0,0,0,0.1);">
          <div style="height:100%; width:${rightPercent}%; background:#B22222; border-radius:12px 0 0 12px; transition: width 0.5s;"></div>
        </div>
      </div>
      <div style="display:flex; justify-content: space-between; margin-top:4px; font-size:12px; color:#800020;">
        <span>${leftPercent}%</span>
        <span>${rightPercent}%</span>
      </div>
    `;
  }

  // 신뢰도 평가 틀 생성 함수
  function renderReliabilitySection(container) {
    container.style.marginTop = '32px';
    container.innerHTML = `
      <h3 style="color:#800020; font-weight:bold; margin-bottom: 8px;">신뢰도 평가</h3>
      <p style="font-size: 14px; margin-bottom: 8px; color:#4B2C2C;">
        백엔드 AI 기반 신뢰도 분석 결과가 여기에 표시됩니다.
      </p>
      <h4 style="color:#800020; font-weight:bold; margin-bottom: 4px;">의심 요소</h4>
      <ul id="suspicion-list" style="font-size: 13px; color:#4B2C2C; margin-top:0; padding-left: 16px;">
        <!-- 예시 아이템 -->
        <li>내용 출처 불명확</li>
        <li>일방적인 주장 포함</li>
        <li>검증되지 않은 통계 사용</li>
      </ul>
    `;
  }

  function createSidebar(title, summary, reporter, politicalBias) {
    const sidebar = document.createElement('aside');
    sidebar.id = 'news-sidebar-container';
    sidebar.style.cssText = sidebarStyle;

    sidebar.innerHTML = `
      <h1 style="
        font-size: 48px; 
        font-weight: 900; 
        margin: 0 0 20px 0; 
        color: #800020;
        user-select: none;
      ">B.B.</h1>
      ${title ? `<h2 style="font-size:20px; margin:0 0 12px 0; color:#4B2C2C;">${title}</h2>` : ''}
      ${reporter ? `<p style="font-size:13px; margin:0 0 20px 0; color:#4B2C2C; font-style: italic;">🖋️ ${reporter}</p>` : ''}
      <h3 style="font-size:16px; margin:0 0 8px 0; color:#800020;">기사 요약</h3>
      <p style="line-height:1.5; font-size:14px; color:#4B2C2C;">${summary}</p>
      <div id="bias-bar-container"></div>
      <div id="reliability-section"></div>
      <button id="news-sidebar-close" style="
        position: absolute; 
        top: 12px; 
        right: 12px; 
        background: transparent; 
        border: none; 
        font-size: 24px; 
        cursor: pointer;
        color: #800020;
        font-weight: bold;
      ">×</button>
    `;

    document.body.appendChild(sidebar);

    sidebar.querySelector('#news-sidebar-close').addEventListener('click', () => {
      sidebar.remove();
    });

    if (politicalBias && typeof politicalBias.left === 'number' && typeof politicalBias.right === 'number') {
      const biasContainer = document.getElementById('bias-bar-container');
      renderPoliticalBiasBar(biasContainer, politicalBias.left, politicalBias.right);
    }

    const reliabilityContainer = document.getElementById('reliability-section');
    renderReliabilitySection(reliabilityContainer);
  }

  const examplePoliticalBias = { left: 45, right: 55 };

  const { title, reporter, fullText } = extractArticleInfo();
  const summary = generateSummary(fullText);
  createSidebar(title, summary, reporter, examplePoliticalBias);
})();
