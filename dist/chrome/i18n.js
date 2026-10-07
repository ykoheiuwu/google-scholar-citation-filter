/* Match Scholar's interface language, independently of the browser's language. */
(function (root) {
  "use strict";
  const messages = {
    ja: {
      viewAll: "すべて表示", compare: "引用グラフを比較", compareHint: "論文を選んで引用グラフを比較",
      title: "引用数の推移", close: "閉じる", adjusted: "■ 調整後", allPapers: "■ 全論文",
      original: "■ 全論文（除外前）", unknownLegend: "▧ 不明（未取得・期間省略）", unknown: "不明",
      noGraph: "このプロフィールには年別引用グラフがありません。",
      yearLabel: "{year}年：調整後 {adjusted} / 全論文 {original}",
      summary: "{total} 論文中 {removed} 件を除外 · 表示期間の引用数 {citations}",
      papersHeading: "集計する論文", papersHint: "チェックを外すと、その論文の年別引用数を差し引きます。",
      includeAll: "すべて含める", searchPlaceholder: "論文名・著者で絞り込み", searchLabel: "論文を検索",
      includePaper: "{title}を集計に含める", unknownYear: "年不明", totalCitations: "総引用数", details: "詳細 ↗",
      fetchingAnnual: "年別データ取得中…", fetchedAnnual: "年別データ取得済み", missingAnnual: "年別データ未取得",
      retry: "再試行", fetchAll: "論文一覧をすべて取得", stop: "取得を停止",
      paused: "取得を停止しました。「再試行」で再開できます。", fetchingPapers: "論文一覧を取得中… {count} 件",
      fetchingDetails: "年別データを取得中… {count} 件", complete: "論文一覧をすべて取得しました。",
      partialList: "画面にある論文を表示中。一覧の続きは未取得です。",
      footnote: "表示上の比較用です。Scholarの登録内容・引用指標は変更しません。年別データは最大24時間、除外設定はこのブラウザに保存します。",
      readStorageError: "設定を読み込めません。このタブ内では引き続き使えます。",
      saveStorageError: "設定を保存できません。ブラウザの空き容量や拡張機能の状態を確認してください。",
      aborted: "取得を中止しました。", otherOrigin: "別のサイトにはアクセスできません。",
      accessLimited: "Scholarがアクセスを制限しています。通常のScholarタブで確認し、時間を置いてから再試行してください。",
      httpError: "Scholarの取得に失敗しました（HTTP {status}）。",
      accessCheck: "Scholarでアクセス確認が必要です。通常のScholarタブで確認してください。",
      timeout: "Scholarの応答が20秒以内に届きませんでした。時間を置いて再試行してください。",
      networkError: "Scholarに接続できません。接続状態を確認して再試行してください。",
      paperListError: "論文一覧を取得できません。Scholarの画面構造やアクセス状態を確認してください。",
      repeatedList: "Scholarから同じ一覧が返されたため取得を停止しました。再試行してください。",
      tooManyPapers: "論文一覧が非常に大きいため取得を停止しました。",
      graphFormat: "年別引用グラフの形式を読み取れません。Scholarの画面構造が変わった可能性があります。",
      conflictingYear: "同じ年の引用数が一致しません。",
      articleError: "論文詳細を取得できません。アクセス制限、ログイン、または画面構造を確認してください。",
      unlistedWarning: "保存された除外設定の論文を、一覧から確認しています。確認が終わるまで調整後の値は不明です。",
      overlapWarning: "除外する論文と別の論文に重複するScholarレコードがあります。重複の影響を分離できないため、調整後の値は不明です。",
      truncatedWarning: "論文詳細に表示されない年は、調整後の値を「不明」と表示します。",
      pendingWarning: "除外する論文の年別引用数を取得するまで、調整後の値は不明です。",
      inconsistentWarning: "全体と論文の引用数が整合しない年があります。更新時差や重複が考えられるため、不明と表示します。"
    },
    en: {
      viewAll: "View all", compare: "Compare citation trends", compareHint: "Select papers to compare citation trends",
      title: "Citation trends", close: "Close", adjusted: "■ Adjusted", allPapers: "■ All papers",
      original: "■ All papers (original)", unknownLegend: "▧ Unknown (pending or missing years)", unknown: "Unknown",
      noGraph: "This profile has no annual citation chart.",
      yearLabel: "{year}: adjusted {adjusted} / all papers {original}",
      summary: "{total} papers · {removed} excluded · Citations in range: {citations}",
      papersHeading: "Papers to include", papersHint: "Uncheck a paper to subtract its annual citations.",
      includeAll: "Include all", searchPlaceholder: "Filter by title or author", searchLabel: "Search papers",
      includePaper: "Include {title} in the calculation", unknownYear: "Year unknown", totalCitations: "Total citations", details: "Details ↗",
      fetchingAnnual: "Fetching annual data…", fetchedAnnual: "Annual data loaded", missingAnnual: "Annual data not loaded",
      retry: "Retry", fetchAll: "Fetch all papers", stop: "Stop fetching",
      paused: "Fetching stopped. Select Retry to resume.", fetchingPapers: "Fetching papers… {count} loaded",
      fetchingDetails: "Fetching annual data… {count} pending", complete: "All papers loaded.",
      partialList: "Showing papers on this page. The rest of the list has not been fetched yet.",
      footnote: "For comparison only. Scholar records and citation metrics are unchanged. Annual data is cached for up to 24 hours; exclusions are saved in this browser.",
      readStorageError: "Settings could not be loaded. You can still use this tab.",
      saveStorageError: "Settings could not be saved. Check browser storage space and extension status.",
      aborted: "Fetching cancelled.", otherOrigin: "Requests to another site are not allowed.",
      accessLimited: "Scholar is restricting access. Check a regular Scholar tab and retry later.",
      httpError: "Could not fetch Scholar data (HTTP {status}).",
      accessCheck: "Scholar requires access verification. Check a regular Scholar tab.",
      timeout: "Scholar did not respond within 20 seconds. Retry later.",
      networkError: "Could not connect to Scholar. Check your connection and retry.",
      paperListError: "Could not fetch the paper list. Check Scholar's page structure and access status.",
      repeatedList: "Scholar returned the same paper list again. Fetching stopped; retry later.",
      tooManyPapers: "Fetching stopped because the paper list is very large.",
      graphFormat: "Could not read the annual citation chart. Scholar's page structure may have changed.",
      conflictingYear: "Conflicting citation counts were found for the same year.",
      articleError: "Could not fetch paper details. Check access restrictions, sign-in, or the page structure.",
      unlistedWarning: "Checking saved exclusions against the paper list. Adjusted counts remain unknown until this is complete.",
      overlapWarning: "An excluded paper shares Scholar records with another paper. Their contributions cannot be separated, so adjusted counts are unknown.",
      truncatedWarning: "Adjusted counts are unknown for years missing from the paper's detail chart.",
      pendingWarning: "Adjusted counts remain unknown until the excluded papers' annual data is loaded.",
      inconsistentWarning: "Profile and paper counts disagree for some years, possibly due to update timing or duplicate records. Those counts are unknown."
    }
  };
  function normalize(value) { return String(value || "").trim().toLowerCase().replace(/_/g, "-"); }
  function detectLanguage({ documentLanguage, hl, scholarText, browserLanguage } = {}) {
    // The rendered document is authoritative, even if URL or browser preferences differ.
    const pageLanguage = normalize(documentLanguage) || normalize(hl);
    if (pageLanguage) return pageLanguage.split("-")[0] === "ja" ? "ja" : "en";
    if (/すべて表示|引用先/.test(scholarText || "")) return "ja";
    if (/view all|cited by/i.test(scholarText || "")) return "en";
    return normalize(browserLanguage).split("-")[0] === "ja" ? "ja" : "en";
  }
  function create(language) {
    const lang = normalize(language).split("-")[0] === "ja" ? "ja" : "en";
    return { language: lang, t(key, values = {}) {
      const message = messages[lang][key];
      if (message === undefined) throw new Error(`Unknown translation key: ${key}`);
      return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
    } };
  }
  const api = { detectLanguage, create, messages };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ScholarFilterI18n = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
