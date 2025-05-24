function shouldInjectSidebar(url) {
  return url.includes('/article/') || url.includes('/news/');
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && shouldInjectSidebar(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert('이 페이지는 뉴스 페이지가 아닙니다. /article/ 또는 /news/ 가 URL에 포함되어야 합니다.')
    });
  }
});
