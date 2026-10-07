(function () {
  "use strict";
  const C = globalThis.ScholarFilterCore;
  if (!C || !new URL(location.href).searchParams.get("user")) return;
  const api = globalThis.browser || globalThis.chrome;
  const profile = new URL(location.href).searchParams.get("user");
  const key = `scf-profile-${profile}`;
  const DAY = 86400000;
  const I = globalThis.ScholarFilterI18n;
  const language = I.detectLanguage({ documentLanguage: document.documentElement.lang,
    hl: new URL(location.href).searchParams.get("hl"),
    scholarText: document.querySelector("#gsc_rsb_cit .gsc_rsb_header")?.textContent,
    browserLanguage: navigator.language });
  const { t } = I.create(language);
  const scholarLanguage = document.documentElement.lang || new URL(location.href).searchParams.get("hl") || language;
  const nf = new Intl.NumberFormat(language === "ja" ? "ja-JP" : "en-US");
  const errorMessage = error => error.name === "TypeError" ? t("networkError") : error.message;
  let panel, shadow, dialog, chart, list, status, note, summary, search, retry, more, stopButton, selectedKey, originalKey;
  let original = {}, allPapers = [], excluded = new Set(), details = new Map(), cache = {};
  let ready = false, paging = false, paused = false, listComplete = false, lastError = "", session = null;
  let saveChain = Promise.resolve(), requestChain = Promise.resolve(), lastRequest = 0;
  let chartStylesReady = false, showNewestOnOpen = false;
  const rows = new Map(), loading = new Set();

  function el(tag, text, cls) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }
  function button(text, fn, cls = "secondary") {
    const b = el("button", text, cls); b.type = "button"; b.addEventListener("click", fn); return b;
  }
  async function readStorage() {
    try {
      if (!api?.storage?.local) return;
      const value = (await api.storage.local.get(key))[key];
      if (!value) return;
      excluded = new Set(Array.isArray(value.excluded) ? value.excluded : []);
      cache = value.cache || {};
    } catch { lastError = t("readStorageError"); }
  }
  function save() {
    if (!api?.storage?.local) return;
    const value = { excluded: [...excluded], cache };
    saveChain = saveChain.catch(() => {}).then(() => api.storage.local.set({ [key]: value })).catch(() => {
      lastError = t("saveStorageError"); render();
    });
  }
  function abortError() { return new DOMException(t("aborted"), "AbortError"); }
  function pause(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortError());
      const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, ms);
      function cancel() { clearTimeout(timer); reject(abortError()); }
      signal.addEventListener("abort", cancel, { once: true });
    });
  }
  function fetchDocument(url, signal) {
    const run = requestChain.catch(() => {}).then(async () => {
      if (signal.aborted) throw abortError();
      const target = new URL(url, location.href);
      if (target.origin !== location.origin) throw new Error(t("otherOrigin"));
      await pause(Math.max(0, 1600 - (Date.now() - lastRequest)), signal);
      lastRequest = Date.now();
      const controller = new AbortController();
      const cancel = () => controller.abort();
      signal.addEventListener("abort", cancel, { once: true });
      let timedOut = false;
      const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 20000);
      try {
        const response = await fetch(target.href, { credentials: "same-origin", signal: controller.signal });
        if (response.status === 429 || response.status === 403) throw new Error(t("accessLimited"));
        if (!response.ok) throw new Error(t("httpError", { status: response.status }));
        if (new URL(response.url || target.href).origin !== location.origin || /\/sorry\//.test(response.url)) throw new Error(t("accessCheck"));
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (doc.querySelector('form[action*="sorry"], .g-recaptcha, #captcha')) throw new Error(t("accessCheck"));
        return doc;
      } catch (error) {
        if (timedOut) throw new Error(t("timeout"));
        throw error;
      } finally {
        clearTimeout(timeout); signal.removeEventListener("abort", cancel);
      }
    });
    requestChain = run;
    return run;
  }
  function mergePapers(incoming) {
    const known = new Map(allPapers.map(p => [p.id,p]));
    for (const p of incoming) known.set(p.id,p);
    allPapers = [...known.values()].sort((a,b) => (b.total ?? -1) - (a.total ?? -1) || a.title.localeCompare(b.title));
    for (const p of incoming) {
      const entry = cache[p.id];
      if (entry && Date.now() - entry.time < DAY && entry.paperTotal === p.total) details.set(p.id,entry.data);
    }
    updateList(); render();
  }
  async function loadPapers() {
    if (paging || listComplete || !session) return;
    const signal = session.signal;
    paging = true; lastError = ""; render();
    try {
      // Fetch from the beginning in a fixed sort order. The current page may be sorted by year.
      let offset = 0;
      const fetched = new Set();
      while (!signal.aborted) {
        const url = new URL("/citations", location.origin);
        url.search = new URLSearchParams({ user: profile, hl: scholarLanguage, cstart: String(offset), pagesize: "100" });
        const doc = await fetchDocument(url.href,signal);
        if (!doc.querySelector("#gsc_a_b")) throw new Error(t("paperListError"));
        const batch = C.papers(doc,url.href);
        if (batch.length && batch.every(p => fetched.has(p.id))) throw new Error(t("repeatedList"));
        for (const p of batch) fetched.add(p.id);
        mergePapers(batch);
        const next = doc.querySelector("#gsc_bpf_more");
        if ((batch.length < 100 && (!next || next.disabled)) || !batch.length) {
          listComplete = true;
          excluded = new Set([...excluded].filter(id => allPapers.some(p => p.id === id)));
          save(); break;
        }
        const previous = offset;
        offset += batch.length;
        if (offset > 10000 || offset === previous) throw new Error(t("tooManyPapers"));
      }
    } catch (error) { if (error.name !== "AbortError") { lastError = errorMessage(error); session?.abort(); } }
    finally { paging = false; render(); loadExcluded(); }
  }
  async function loadExcluded() {
    if (!session || session.signal.aborted) return;
    const signal = session.signal;
    for (const paper of allPapers) {
      if (!excluded.has(paper.id) || details.has(paper.id) || loading.has(paper.id) || paper.total === 0) continue;
      loading.add(paper.id); render(); updateRow(paper);
      try {
        const doc = await fetchDocument(paper.url,signal);
        const data = C.article(doc,paper.url,t);
        details.set(paper.id,data);
        cache[paper.id] = { data, time: Date.now(), paperTotal: paper.total };
        // Only keep recently used entries, to bound local storage size.
        for (const id of Object.keys(cache)) if (Date.now() - cache[id].time > DAY) delete cache[id];
        save();
      } catch (error) {
        if (error.name !== "AbortError") { lastError = errorMessage(error); session?.abort(); }
      } finally { loading.delete(paper.id); updateRow(paper); render(); }
      if (signal.aborted) break;
    }
  }
  function updateRow(paper) {
    const row = rows.get(paper.id); if (!row) return;
    row.check.checked = !excluded.has(paper.id);
    row.root.classList.toggle("excluded", excluded.has(paper.id));
    row.state.textContent = loading.has(paper.id) ? t("fetchingAnnual") : details.has(paper.id) ? t("fetchedAnnual") : excluded.has(paper.id) && paper.total !== 0 ? t("missingAnnual") : "";
  }
  function updateList() {
    if (!list) return;
    for (const paper of allPapers) {
      if (!rows.has(paper.id)) {
        const root = el("li", undefined,"paper");
        const label = el("label");
        const check = el("input"); check.type = "checkbox"; check.setAttribute("aria-label", t("includePaper", { title: paper.title }));
        const info = el("span",undefined,"paper-info");
        info.append(el("span",paper.title,"paper-title"),el("span",`${paper.publicationYear || t("unknownYear")} · ${paper.meta}`,"paper-meta"));
        const state = el("span","","paper-state"); info.append(state);
        label.append(check,info);
        const right = el("span",undefined,"paper-right");
        right.append(el("strong",paper.total === null ? "—" : nf.format(paper.total)),el("span",t("totalCitations")));
        const link = el("a",t("details")); link.href = paper.url; link.target = "_blank"; link.rel = "noopener noreferrer"; right.append(link);
        root.append(label,right); rows.set(paper.id,{root,check,state});
        check.addEventListener("change", () => {
          if (check.checked) excluded.delete(paper.id); else excluded.add(paper.id);
          paused=false; startSession(); save(); updateRow(paper); render(); loadExcluded();
        });
      }
      updateRow(paper); list.append(rows.get(paper.id).root);
    }
    filterList();
  }
  function filterList() {
    const term = search?.value.trim().toLocaleLowerCase() || "";
    for (const paper of allPapers) rows.get(paper.id).root.hidden = !`${paper.title} ${paper.meta}`.toLocaleLowerCase().includes(term);
  }
  function showNewestYear() {
    if (!showNewestOnOpen || !chartStylesReady || !dialog?.open || !chart?.clientWidth) return;
    chart.scrollLeft = chart.scrollWidth;
    showNewestOnOpen = false;
  }
  function draw(series) {
    const scrollPosition = chart.scrollLeft;
    chart.replaceChildren();
    chart.classList.toggle("has-exclusions", excluded.size > 0);
    selectedKey.textContent = excluded.size > 0 ? t("adjusted") : t("allPapers");
    originalKey.hidden = excluded.size === 0;
    const years = Object.keys(original).map(Number).sort((a,b)=>a-b);
    if (!years.length) { chart.append(el("p",t("noGraph"))); return; }
    const max = Math.max(1,...Object.values(original).filter(n=>n!==null));
    const grid = el("div",undefined,"bars");
    grid.style.setProperty("--years",years.length);
    for (const y of years) {
      const group = el("div",undefined,"year-group");
      const n = series[y];
      const originalCount = original[y];
      const value = el("span",n === null ? "?" : nf.format(n),"bar-value");
      const track = el("div",undefined,"bar-track");
      const old = el("div",undefined,"original-bar"); old.style.height = `${100 * (originalCount ?? 0)/max}%`;
      const bar = el("div",undefined,n === null ? "filtered-bar unknown" : "filtered-bar"); bar.style.height = n === null ? old.style.height : `${100*n/max}%`;
      track.append(old,bar); group.append(value,track,el("span",String(y),"year"));
      group.title = t("yearLabel", { year: y, adjusted: n === null ? t("unknown") : nf.format(n), original: originalCount === null ? t("unknown") : nf.format(originalCount) });
      group.setAttribute("role","img"); group.setAttribute("aria-label",group.title); grid.append(group);
    }
    chart.append(grid);
    // Updating counts must preserve any position the user chose while browsing older years.
    chart.scrollLeft = scrollPosition;
    showNewestYear();
  }
  function render() {
    if (!chart) return;
    const result = C.aggregate(original,allPapers,excluded,details,t);
    draw(result.series);
    const values = Object.values(result.series);
    summary.textContent = t("summary", { total: nf.format(allPapers.length), removed: nf.format(result.removed), citations: values.some(n=>n===null) || !values.length ? t("unknown") : nf.format(values.reduce((a,b)=>a+b,0)) });
    note.textContent = result.warnings.join(" "); note.hidden = !result.warnings.length;
    status.textContent = lastError || (paused ? t("paused") : paging ? t("fetchingPapers", { count: nf.format(allPapers.length) }) : loading.size ? t("fetchingDetails", { count: nf.format(loading.size) }) : listComplete ? t("complete") : t("partialList"));
    status.classList.toggle("error",Boolean(lastError));
    retry.hidden = !lastError && !paused;
    more.hidden = listComplete || paging || Boolean(lastError);
    stopButton.hidden = paused || (!paging && !loading.size);
  }
  function startSession() { if (!session || session.signal.aborted) session = new AbortController(); }
  function close() { session?.abort(); dialog.close(); }
  function buildDialog() {
    const host = el("div"); host.id = "scf-host"; host.lang = language; host.dir = "ltr"; document.body.append(host);
    shadow = host.attachShadow({mode:"open"});
    const stylesheet = el("link"); stylesheet.rel = "stylesheet";
    stylesheet.addEventListener("load", () => { chartStylesReady = true; showNewestYear(); });
    // The same source runs in the fixture page without any extension permissions.
    if (api?.runtime?.getURL) stylesheet.href = api.runtime.getURL("content.css");
    else stylesheet.href = "/extension/content.css";
    shadow.append(stylesheet);
    dialog = el("dialog"); dialog.setAttribute("aria-labelledby","scf-title");
    const header = el("header"); const heading = el("div");
    heading.append(el("span","SCHOLAR CITATION FILTER","eyebrow"));
    const h = el("h2",t("title")); h.id = "scf-title"; heading.append(h,el("p",document.querySelector("#gsc_prf_in")?.textContent || "Google Scholar","author"));
    const dismiss = button("×",close,"close"); dismiss.setAttribute("aria-label",t("close")); header.append(heading,dismiss);
    const body = el("div",undefined,"body");
    summary = el("p","","summary");
    const legend = el("div",undefined,"legend");
    selectedKey = el("span",t("allPapers"),"selected-key");
    originalKey = el("span",t("original"),"original-key");
    legend.append(selectedKey,originalKey,el("span",t("unknownLegend")));
    chart = el("div",undefined,"chart");
    note = el("p","","notice"); note.setAttribute("role","status");
    const tools = el("div",undefined,"tools");
    const text = el("div"); text.append(el("h3",t("papersHeading")),el("p",t("papersHint")));
    tools.append(text,button(t("includeAll"),()=>{ excluded.clear(); save(); updateList(); render(); }));
    search = el("input"); search.type="search"; search.placeholder=t("searchPlaceholder"); search.setAttribute("aria-label",t("searchLabel")); search.addEventListener("input",filterList);
    list = el("ul",undefined,"papers");
    status = el("p","","status"); status.setAttribute("role","status");
    retry = button(t("retry"),()=>{ lastError=""; paused=false; startSession(); render(); loadExcluded(); loadPapers(); });
    more = button(t("fetchAll"),()=>{ startSession(); loadPapers(); });
    stopButton = button(t("stop"),()=>{ paused=true; session?.abort(); render(); });
    const actions = el("div",undefined,"actions"); actions.append(retry,more,stopButton);
    const foot = el("p",t("footnote"),"footnote");
    body.append(summary,legend,chart,note,tools,search,list,status,actions,foot); dialog.append(header,body); shadow.append(dialog);
    dialog.addEventListener("cancel",()=>session?.abort());
    dialog.addEventListener("click",event=>{ if(event.target===dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) close(); } });
  }
  async function open() {
    if (!dialog) buildDialog();
    if (dialog.open) return;
    showNewestOnOpen = true;
    try { original = C.graph(panel, false, location.href, t); } catch (error) { original={}; lastError=errorMessage(error); }
    if (!ready) { await readStorage(); ready=true; }
    mergePapers(C.papers(document,location.href));
    dialog.showModal(); paused=false; startSession(); render();
    loadExcluded(); loadPapers();
  }
  function install() {
    panel = document.querySelector("#gsc_rsb_cit"); if (!panel) return;
    const header = panel.querySelector(".gsc_rsb_header") || panel;
    let opener = document.querySelector("#gsc_hist_opn");
    if (!opener) { opener = button(t("viewAll"),()=>{}); opener.id="scf-open"; opener.className="scf-open"; header.append(opener); }
    opener.classList.add("scf-always-visible");
    opener.setAttribute("aria-label",`${t("viewAll")}: ${t("compareHint")}`);
    opener.title=t("compareHint");
    opener.addEventListener("click",event=>{ event.preventDefault(); event.stopImmediatePropagation(); open(); },true);
    // On narrower Scholar layouts the Cited by panel is behind a tab. Keep a visible entry point near the name too.
    const name = document.querySelector("#gsc_prf_in");
    if (name) { const b=button(t("compare"),open); b.className="scf-shortcut"; name.insertAdjacentElement("afterend",b); }
  }
  install();
})();
