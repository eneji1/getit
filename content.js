(function () {
  if (!(location.href.includes('/article/') || location.href.includes('/news/'))) return;
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

  // 본문 필터링 함수: 날짜, 기자, 저작권, 짧은 문장 제외
  function isValidParagraph(text) {
    if (!text) return false;
    if (text.length < 60) return false; // 너무 짧은 문장 제외
    const forbiddenPatterns = [
      /기사입력/i,
      /수정/i,
      /무단전재/i,
      /재배포/i,
      /ⓒ/i,
      /Copyright/i,
      /저작권/i,
      /\d{4}.\d{2}.\d{2}/, // 날짜 패턴
      /연합뉴스/i,
      /출처:/i,
      /기자/i
    ];
    return !forbiddenPatterns.some(pattern => pattern.test(text));
  }

  function extractArticleInfo() {
    // 제목
    const titleEl = document.querySelector('h1');
    const title = titleEl ? titleEl.innerText.trim() : '';

    // 본문 문단 수집
    const possibleSelectors = ['article p', '.article-content p', '.news-content p', 'div.article-body p'];
    let paragraphs = [];
    for (const sel of possibleSelectors) {
      const nodes = Array.from(document.querySelectorAll(sel));
      if (nodes.length > 5) {
        paragraphs = nodes;
        break;
      }
    }
    if (paragraphs.length === 0) {
      paragraphs = Array.from(document.querySelectorAll('p'));
    }

    // 필터링 적용
    const filteredTexts = paragraphs
      .map(p => p.innerText.trim())
      .filter(isValidParagraph);

    // 본문으로 쓸 텍스트
    let fullText = filteredTexts.join(' ');
    if (!fullText || fullText.length < 100) {
      // 너무 짧으면 그냥 상위 5개 문단 합침
      fullText = paragraphs.slice(0, 5).map(p => p.innerText.trim()).join(' ');
    }

    // 기자명
    const reporterEl = document.querySelector('[class*=reporter], .byline, .author, [rel=author]');
    const reporter = reporterEl ? reporterEl.innerText.trim() : '';

    // 날짜는 아예 뺌
    const date = '';

    return { title, fullText, reporter, date };
  }

  function generateSummary(text) {
    if (!text) return '요약할 내용이 없습니다.';
    // 문장 단위로 분리 (마침표, 느낌표, 물음표 기준)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
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

    let dominant = leftPercent >= rightPercent ? '좌파' : '우파';
    let dominantPercent = leftPercent >= rightPercent ? leftPercent : rightPercent;

    container.insertAdjacentHTML('beforeend', `
      <p style="margin-top:8px; font-size:13px; color:#444;">
        이 기사는 <strong>${dominantPercent}%</strong>로 <strong>${dominant}</strong> 성향을 띕니다.
      </p>
    `);
  }

  function createSidebar(title, summary, reporter, date, politicalBias) {
    if (document.getElementById('news-sidebar-container')) return;

    const sidebar = document.createElement('aside');
    sidebar.id = 'news-sidebar-container';
    sidebar.style.cssText = sidebarStyle;

    sidebar.innerHTML = `
      <h2 style="font-size:20px; margin-top:0;">${title || '제목 없음'}</h2>
      <div style="font-size:13px; color:#666; margin-bottom: 6px;">
        ${reporter ? `🖋️ ${reporter}` : ''}
      </div>
      <h3 style="font-size:16px; margin-top:20px;">요약</h3>
      <p style="line-height:1.5; font-size:14px;">${summary}</p>
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
  const { title, fullText, reporter, date } = extractArticleInfo();
  const summary = generateSummary(fullText);

  const politicalBias = {
    left: 65,
    right: 35
  };

  createSidebar(title, summary, reporter, date, politicalBias);
})();
