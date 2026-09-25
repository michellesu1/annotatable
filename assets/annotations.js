/* Personal annotations; course content and math DOM are never rewritten. */
(() => {
  const widget = document.getElementById("study-widget");
  const article = document.getElementById("quarto-document-content");
  if (!widget || !article) return;
  const $ = (s) => (s === "#article" ? article : widget.querySelector(s)),
    colors = {
      Butter: "#fff0ae",
      Rose: "#ffd5e3",
      Lavender: "#e3d5fa",
      Mint: "#cef0df",
      Sky: "#cfe8fc",
    };
  const key = "ml-study-annotations-v1";
  let records = [],
    chapter,
    selection = null,
    editing = null,
    nodes = [],
    selectionTimer;
  function status(t) {
    $("#status").textContent = t;
  }
  function hint(t) {
    $("#hint").textContent = t;
  }
  try {
    records = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(records)) records = [];
    records = records.filter(validRecord);
  } catch {
    status("Browser storage unavailable");
  }
  function save(next) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      records = next;
      status("Saved in this browser");
      render();
      return true;
    } catch {
      status("Could not save — download a backup");
      hint("Browser storage is unavailable or full. Please download a backup.");
      return false;
    }
  }
  function textNodes() {
    const w = document.createTreeWalker($("#article"), NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.parentElement.closest("script,style,mjx-assistive-mml")
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    let a = [],
      n,
      pos = 0;
    while ((n = w.nextNode())) {
      a.push({ node: n, start: pos, end: pos + n.length });
      pos += n.length;
    }
    return a;
  }
  function rangeFor(start, end) {
    const a = nodes.find((n) => n.end > start),
      b = nodes.find((n) => n.end >= end && n.start < end);
    if (!a || !b) return null;
    const r = document.createRange();
    r.setStart(a.node, start - a.start);
    r.setEnd(b.node, end - b.start);
    return r;
  }
  function capture() {
    const s = window.getSelection();
    if (!s.rangeCount || s.isCollapsed) return;
    const r = s.getRangeAt(0);
    if (
      !$("#article").contains(r.startContainer) ||
      !$("#article").contains(r.endContainer)
    )
      return;
    nodes = textNodes();
    const intersect = nodes.filter((n) => r.intersectsNode(n.node));
    if (!intersect.length) return;
    const first = intersect[0],
      last = intersect.at(-1);
    const start =
        first.start + (r.startContainer === first.node ? r.startOffset : 0),
      end =
        last.start +
        (r.endContainer === last.node ? r.endOffset : last.node.length);
    const quote = nodes
      .map((n) => n.node.textContent)
      .join("")
      .slice(start, end)
      .trim();
    if (quote) {
      selection = { start, end, quote };
      hint("Passage selected. Pick a pastel color or add a comment.");
    }
  }
  document.addEventListener("selectionchange", () => {
    clearTimeout(selectionTimer);
    selectionTimer = setTimeout(capture, 80);
  });
  for (const [name, color] of Object.entries(colors)) {
    const b = document.createElement("button");
    b.className = "swatch";
    b.style.background = color;
    b.style.setProperty("--color", color);
    b.title = name + " highlight";
    b.setAttribute("aria-label", name + " highlight");
    b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.onclick = () => add(name);
    $("#palette").append(b);
  }
  function add(color, comment = "") {
    if (!selection || !chapter) {
      hint("Select some text in the notes first.");
      return false;
    }
    const rec = {
      id: crypto.randomUUID(),
      chapter: chapter.id,
      ...selection,
      color,
      comment,
    };
    if (save([...records, rec])) {
      hint("Highlight saved. Click its margin note to return to it.");
      window.getSelection().removeAllRanges();
      selection = null;
      return true;
    }
    return false;
  }
  function openEditor(record) {
    if (!record && !selection) {
      hint("Select a passage to comment on first.");
      return;
    }
    editing = record || null;
    $("#quote").textContent = (record || selection).quote;
    $("#comment-text").value = record?.comment || "";
    $("#editor-title").textContent = record ? "Edit comment" : "Add a comment";
    $("#editor").showModal();
    $("#comment-text").focus();
  }
  $("#comment").addEventListener("pointerdown", (e) => e.preventDefault());
  $("#comment").onclick = () => openEditor();
  $("#save-comment").onclick = (e) => {
    e.preventDefault();
    const comment = $("#comment-text").value.trim();
    if (!comment) {
      $("#comment-text").focus();
      return;
    }
    const success = editing
      ? save(records.map((r) => (r.id === editing.id ? { ...r, comment } : r)))
      : add("Lavender", comment);
    if (success) $("#editor").close();
  };
  function render() {
    if (!chapter) return;
    nodes = textNodes();
    if (window.CSS?.highlights) {
      for (const name of Object.keys(colors)) {
        const ranges = records
          .filter((r) => r.chapter === chapter.id && r.color === name)
          .map((r) => recordRange(r))
          .filter(Boolean);
        CSS.highlights.set(
          "ml-study-" + name.toLowerCase(),
          new Highlight(...ranges),
        );
      }
    } else
      hint(
        "Highlight display requires an up-to-date Chrome, Edge, Safari, or Firefox browser. Your comments still save.",
      );
    const list = $("#notes");
    list.replaceChildren();
    const current = records.filter((r) => r.chapter === chapter.id);
    $("#count").textContent = current.length;
    if (!current.length) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent =
        "A little room for your thinking. Highlight a passage to start.";
      list.append(p);
    }
    for (const r of current) {
      const card = document.createElement("div");
      card.className = "note";
      card.style.setProperty("--color", colors[r.color]);
      const quote = document.createElement("blockquote");
      quote.textContent = r.quote;
      quote.tabIndex = 0;
      quote.setAttribute("role", "button");
      quote.title = "Jump to passage";
      const jump = () => {
        const range = recordRange(r);
        if (range) {
          range.startContainer.parentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          const s = window.getSelection();
          s.removeAllRanges();
          s.addRange(range);
        }
      };
      quote.onclick = jump;
      quote.onkeydown = (e) => {
        if (e.key === "Enter") jump();
      };
      card.append(quote);
      if (r.comment) {
        const p = document.createElement("p");
        p.textContent = r.comment;
        card.append(p);
      }
      const actions = document.createElement("div");
      actions.className = "actions";
      const edit = document.createElement("button");
      edit.textContent = r.comment ? "Edit" : "Comment";
      edit.onclick = () => openEditor(r);
      const del = document.createElement("button");
      del.textContent = "Remove";
      del.onclick = () => {
        save(records.filter((x) => x.id !== r.id));
        hint("Annotation removed.");
      };
      actions.append(edit, del);
      card.append(actions);
      list.append(card);
    }
  }
  const styles = document.createElement("style");
  styles.textContent = Object.entries(colors)
    .map(
      ([n, c]) =>
        `::highlight(ml-study-${n.toLowerCase()}){background-color:${c};color:#292735}`,
    )
    .join("");
  document.head.append(styles);
  $("#backup").onclick = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, annotations: records }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-6.390-notes.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $("#restore").onclick = () => $("#import").click();
  $("#import").onchange = async (e) => {
    try {
      const d = JSON.parse(await e.target.files[0].text());
      if (
        d.version !== 1 ||
        !Array.isArray(d.annotations) ||
        d.annotations.some((r) => !validRecord(r))
      )
        throw Error();
      const merged = new Map(records.map((r) => [r.id, r]));
      for (const r of d.annotations) merged.set(r.id, r);
      if (save([...merged.values()])) hint("Backup restored.");
    } catch {
      hint("That file is not a valid study-notes backup.");
    }
    e.target.value = "";
  };

  function recordRange(record) {
    const text = nodes.map((n) => n.node.textContent).join("");
    if (text.slice(record.start, record.end).trim() === record.quote)
      return rangeFor(record.start, record.end);
    let start = text.indexOf(record.quote),
      best = -1;
    while (start >= 0) {
      if (
        best < 0 ||
        Math.abs(start - record.start) < Math.abs(best - record.start)
      )
        best = start;
      start = text.indexOf(record.quote, start + 1);
    }
    return best < 0 ? null : rangeFor(best, best + record.quote.length);
  }
  $("#toggle-notes").onclick = () => {
    $("#study-panel").hidden = !$("#study-panel").hidden;
  };
  $("#close-notes").onclick = () => {
    $("#study-panel").hidden = true;
  };

  function isChapterId(value) {
    return typeof value === "string" && /^[a-zA-Z0-9_-]+\.html$/.test(value);
  }
  function validRecord(r) {
    return (
      r &&
      typeof r.id === "string" &&
      isChapterId(r.chapter) &&
      typeof r.quote === "string" &&
      r.quote.trim().length > 0 &&
      typeof r.comment === "string" &&
      Object.hasOwn(colors, r.color) &&
      Number.isInteger(r.start) &&
      Number.isInteger(r.end) &&
      r.start >= 0 &&
      r.end > r.start
    );
  }
  async function init() {
    const file = location.pathname.split("/").pop() || "index.html";
    chapter = {
      id: file.endsWith(".html") ? file : file + ".html",
      title: document.title,
    };
    try {
      if (window.MathJax?.startup?.promise)
        await window.MathJax.startup.promise;
    } catch {}
    render();
    // Quarto's pseudocode filter may typeset after the initial MathJax pass.
    let timer;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    }).observe(article, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
