const CATEGORIES = ["野菜", "豚肉", "ご飯もの", "その他", "牛肉", "麺類", "鶏肉", "卵"];
const TYPES = ["和える", "炒める", "その他", "煮る", "サラダ", "揚げる", "汁物", "焼く"];

let selectedCategory = "";
let selectedType = "";
let view = "search";
const STORE = {favorites: "yurutakunomi.favorites.v1", recent: "yurutakunomi.recent.v1"};
// Official URLs remain stable when the database order or recipe names change.
const byUrl = new Map(window.RECIPES.map(r => [r.url, r]));
let favorites = new Set(readSaved(STORE.favorites));
let recent = readSaved(STORE.recent).slice(0, 10);

function storageNotice() {
  const notice = document.querySelector("#storageNotice");
  notice.hidden = false;
  notice.textContent = "このブラウザでは保存を利用できません。今回の操作はページを閉じるまで有効です。";
}

function readSaved(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? [...new Set(value.filter(url => typeof url === "string" && byUrl.has(url)))] : [];
  } catch (error) {
    if (!(error instanceof SyntaxError)) storageNotice();
    return [];
  }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { storageNotice(); }
}

function recordVisit(url) {
  recent = [url, ...recent.filter(item => item !== url)].slice(0, 10);
  save(STORE.recent, recent);
  syncView();
  // Keep the activated link in place until the browser finishes opening it.
  if (view === "recent") setTimeout(render, 0);
}

function syncView() {
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  $("#favoriteCount").textContent = favorites.size;
  $("#recentCount").textContent = recent.length;
  $("#resultsTitle").textContent = {search: "検索結果", favorites: "★ お気に入り", recent: "最近見た"}[view];
  $("#viewHint").textContent = view === "search"
    ? "☆でお気に入りに保存。料理名を押すと公式レシピが開きます。"
    : (view === "recent" ? "新しく開いた順に最大10件。" : "登録したお気に入りをすべて表示。") + "検索条件を操作すると通常検索へ戻ります。";
}

const $ = (s) => document.querySelector(s);
const norm = (v) => (v || "").toString().trim().toLowerCase();

function makeChips(container, values, kind) {
  container.innerHTML = "";
  values.forEach(value => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = value;
    b.dataset.value = value;
    b.addEventListener("click", () => {
      view = "search";
      if (kind === "category") selectedCategory = selectedCategory === value ? "" : value;
      else selectedType = selectedType === value ? "" : value;
      syncChips();
      render();
    });
    container.appendChild(b);
  });
}

function syncChips() {
  document.querySelectorAll("#categoryChips .chip").forEach(b => b.classList.toggle("active", b.dataset.value === selectedCategory));
  document.querySelectorAll("#typeChips .chip").forEach(b => b.classList.toggle("active", b.dataset.value === selectedType));
}

function filteredRecipes() {
  if (view === "favorites") return window.RECIPES.filter(r => favorites.has(r.url));
  if (view === "recent") return recent.map(url => byUrl.get(url)).filter(Boolean);
  const ingredient = norm($("#ingredientInput").value);
  const keyword = norm($("#keywordInput").value);
  return window.RECIPES.filter(r => {
    if (selectedCategory && r.category !== selectedCategory) return false;
    if (selectedType && r.type !== selectedType) return false;
    if (ingredient && !norm(r.ingredients).includes(ingredient)) return false;
    if (keyword) {
      const hay = norm([r.name,r.category,r.type,r.ingredients,r.feature,r.search].join(" "));
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });
}

function render() {
  syncView();
  const rows = filteredRecipes();
  $("#resultCount").textContent = `${rows.length}件`;
  const root = $("#results");
  root.innerHTML = "";
  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = {search: "条件に合うレシピがありません。", favorites: "お気に入りはまだありません。レシピの☆を押して保存できます。", recent: "まだ閲覧履歴がありません。料理名から公式レシピを開くと、ここに表示されます。"}[view];
    root.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  rows.forEach(r => {
    const row = document.createElement("div");
    row.className = "recipe-row";
    const a = document.createElement("a");
    a.className = "recipe";
    a.href = r.url;
    a.target = "_blank";
    a.rel = "noopener nofollow";
    a.addEventListener("click", e => { if (!e.defaultPrevented && e.button === 0) recordVisit(r.url); });
    a.addEventListener("auxclick", e => { if (!e.defaultPrevented && e.button === 1) recordVisit(r.url); });
    a.innerHTML = `
      <div class="recipe-main">
        <div class="recipe-name">${escapeHtml(r.name)}</div>
        <div class="recipe-meta">${escapeHtml(r.category)} ｜ ${escapeHtml(r.type)}</div>
        ${r.ingredients ? `<div class="recipe-ingredients">${escapeHtml(r.ingredients)}</div>` : ""}
      </div>
      <div class="chev">›</div>`;
    const star = document.createElement("button");
    star.type = "button";
    star.className = "favorite-button";
    star.dataset.url = r.url;
    const syncStar = () => {
      const active = favorites.has(r.url);
      star.textContent = active ? "★" : "☆";
      star.setAttribute("aria-pressed", String(active));
      star.setAttribute("aria-label", `${r.name}をお気に入り${active ? "から解除" : "に登録"}`);
    };
    syncStar();
    star.addEventListener("click", () => {
      if (favorites.has(r.url)) favorites.delete(r.url);
      else favorites.add(r.url);
      save(STORE.favorites, [...favorites]);
      if (view === "favorites") {
        const index = rows.indexOf(r);
        render();
        const buttons = document.querySelectorAll(".favorite-button");
        (buttons[Math.min(index, buttons.length - 1)] || $("[data-view='favorites']")).focus({preventScroll: true});
      } else { syncStar(); syncView(); }
    });
    row.append(a, star);
    frag.appendChild(row);
  });
  root.appendChild(frag);
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

makeChips($("#categoryChips"), CATEGORIES, "category");
makeChips($("#typeChips"), TYPES, "type");

$("#ingredientInput").addEventListener("input", e => {
  view = "search";
  $("#clearIngredient").hidden = !e.target.value;
  render();
});
$("#clearIngredient").addEventListener("click", () => {
  view = "search";
  $("#ingredientInput").value = "";
  $("#clearIngredient").hidden = true;
  $("#ingredientInput").focus();
  render();
});
$("#keywordInput").addEventListener("input", () => { view = "search"; render(); });
document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => {
  view = view === b.dataset.view ? "search" : b.dataset.view;
  render();
}));
window.addEventListener("storage", e => {
  if (e.key === null || Object.values(STORE).includes(e.key)) {
    favorites = new Set(readSaved(STORE.favorites));
    recent = readSaved(STORE.recent).slice(0, 10);
    render();
  }
});

render();
