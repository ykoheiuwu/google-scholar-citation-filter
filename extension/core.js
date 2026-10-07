/* DOM parsing and arithmetic; shared by the extension and the offline demo. */
(function (root) {
  "use strict";
  const I = typeof module !== "undefined" && module.exports ? require("./i18n.js") : root.ScholarFilterI18n;
  const defaultT = I.create("ja").t;
  function number(text) {
    const s = String(text ?? "").replace(/[\s,\u202a-\u202e\u2066-\u2069]/g, "");
    return /^\d+$/.test(s) && Number.isSafeInteger(Number(s)) ? Number(s) : null;
  }
  function year(text) {
    const n = number(text);
    return n >= 1800 && n <= 2200 ? n : null;
  }
  function graph(container, article = false, base = "https://scholar.google.com", t = defaultT) {
    if (!container) return {};
    const prefix = article ? "gsc_oci_g" : "gsc_g";
    const labels = [...container.querySelectorAll(`.${prefix}_t`)];
    const bars = [...container.querySelectorAll(`.${prefix}_a`)];
    const series = {};
    for (const bar of bars) {
      let y = null;
      if (article) {
        try { y = year(new URL(bar.getAttribute("href"), base).searchParams.get("as_ylo")); } catch { /* fall back to labels */ }
      }
      if (y === null) {
        const side = bar.style.left ? "left" : "right";
        const position = parseFloat(bar.style[side]);
        const match = labels.find(label => Math.abs(parseFloat(label.style[side]) - position) <= 8);
        y = match ? year(match.textContent) : null;
      }
      const n = number(bar.querySelector(`.${prefix}_al`)?.textContent);
      if (y === null || n === null) throw new Error(t("graphFormat"));
      if (series[y] !== undefined && series[y] !== n) throw new Error(t("conflictingYear"));
      series[y] = n;
    }
    // A label with no readable bar is unknown, never silently zero.
    for (const label of labels) {
      const y = year(label.textContent);
      if (y !== null && series[y] === undefined) series[y] = null;
    }
    return series;
  }
  function papers(doc, base) {
    return [...doc.querySelectorAll(".gsc_a_tr")].flatMap(row => {
      const link = row.querySelector(".gsc_a_at");
      if (!link) return [];
      const url = new URL(link.getAttribute("href"), base);
      const id = url.searchParams.get("citation_for_view");
      if (!id || url.origin !== new URL(base).origin) return [];
      let clusters = [];
      const cited = row.querySelector(".gsc_a_ac");
      try { clusters = (new URL(cited.getAttribute("href"), base).searchParams.get("cites") || "").split(",").filter(Boolean).sort(); } catch { /* uncited */ }
      return [{ id, url: url.href, title: link.textContent.trim(),
        total: number(cited?.textContent) ?? (cited?.textContent.trim() === "" ? 0 : null),
        publicationYear: year(row.querySelector(".gsc_a_y")?.textContent),
        meta: row.querySelector(".gs_gray")?.textContent.trim() || "", clusters }];
    });
  }
  function article(doc, base, t = defaultT) {
    if (!doc.querySelector("#gsc_oci_title")) throw new Error(t("articleError"));
    const series = graph(doc.querySelector("#gsc_oci_graph"), true, base, t);
    const citationLink = [...doc.querySelectorAll("#gsc_oci_table a")].find(a => {
      try { return new URL(a.getAttribute("href"), base).searchParams.has("cites"); } catch { return false; }
    });
    const match = citationLink?.textContent.replace(/[,\s]/g, "").match(/\d+/);
    const total = match ? number(match[0]) : null;
    const values = Object.values(series);
    const complete = values.length > 0 && values.every(n => n !== null) && total !== null && values.reduce((a,b) => a+b,0) === total;
    return { series, complete, total };
  }
  function aggregate(original, allPapers, excluded, details, t = defaultT) {
    const removed = allPapers.filter(p => excluded.has(p.id));
    const kept = allPapers.filter(p => !excluded.has(p.id));
    const warnings = new Set();
    const unlisted = [...excluded].some(id => !allPapers.some(p => p.id === id));
    if (unlisted) warnings.add(t("unlistedWarning"));
    const unique = [];
    const seen = new Set();
    let overlap = false;
    for (const p of removed) {
      const key = p.clusters.length ? p.clusters.join(",") : p.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const sharing = other => other.clusters.some(c => p.clusters.includes(c));
      if (kept.some(sharing) || unique.some(other => sharing(other) && other.clusters.join(",") !== key)) overlap = true;
      unique.push(p);
    }
    if (overlap) warnings.add(t("overlapWarning"));
    const result = {};
    for (const [y, initial] of Object.entries(original)) {
      let value = initial;
      for (const p of unique) {
        if (p.total === 0) continue;
        const data = details.get(p.id);
        let count = data?.series[y];
        if (count === undefined && data?.complete) count = 0;
        if (count === undefined || count === null) {
          value = null;
          warnings.add(data ? t("truncatedWarning") : t("pendingWarning"));
          break;
        }
        if (value !== null) value -= count;
      }
      if (value !== null && value < 0) {
        value = null;
        warnings.add(t("inconsistentWarning"));
      }
      result[y] = overlap || unlisted ? null : value;
    }
    return { series: result, warnings: [...warnings], removed: removed.length };
  }
  const api = { number, year, graph, papers, article, aggregate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ScholarFilterCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
