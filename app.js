const CATEGORIES = ["野菜", "豚肉", "ご飯もの", "その他", "牛肉", "麺類", "鶏肉", "卵"];
const TYPES = ["和える", "炒める", "その他", "煮る", "サラダ", "揚げる", "汁物", "焼く"];

let selectedCategory = "";
let selectedType = "";

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
  const rows = filteredRecipes();
  $("#resultCount").textContent = `${rows.length}件`;
  const root = $("#results");
  root.innerHTML = "";
  if (!rows.length) {
    root.innerHTML = '<div class="empty">条件に合うレシピがありません。</div>';
    return;
  }
  const frag = document.createDocumentFragment();
  rows.forEach(r => {
    const a = document.createElement("a");
    a.className = "recipe";
    a.href = r.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `
      <div class="recipe-main">
        <div class="recipe-name">${escapeHtml(r.name)}</div>
        <div class="recipe-meta">${escapeHtml(r.category)} ｜ ${escapeHtml(r.type)}</div>
        ${r.ingredients ? `<div class="recipe-ingredients">${escapeHtml(r.ingredients)}</div>` : ""}
      </div>
      <div class="chev">›</div>`;
    frag.appendChild(a);
  });
  root.appendChild(frag);
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

makeChips($("#categoryChips"), CATEGORIES, "category");
makeChips($("#typeChips"), TYPES, "type");

$("#ingredientInput").addEventListener("input", e => {
  $("#clearIngredient").hidden = !e.target.value;
  render();
});
$("#clearIngredient").addEventListener("click", () => {
  $("#ingredientInput").value = "";
  $("#clearIngredient").hidden = true;
  $("#ingredientInput").focus();
  render();
});
$("#keywordInput").addEventListener("input", render);

render();
