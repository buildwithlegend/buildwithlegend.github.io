function initSearch(){
  const grid = document.getElementById("postGrid");
  if(!grid) return;

  const posts = JSON.parse(document.getElementById("DATA_POSTS").textContent);
  const tags = JSON.parse(document.getElementById("DATA_TAGS").textContent);
  const cats = JSON.parse(document.getElementById("DATA_CATS").textContent);

  const search = document.getElementById("searchInput");
  const select = document.getElementById("categorySelect");
  const chipWrap = document.getElementById("tagChips");
  const count = document.getElementById("resultCount");

  select.innerHTML = '<option value="">全部分類</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join("");
  chipWrap.innerHTML = tags.slice(0, 10).map(t=>`<button class="chip" type="button" data-tag="${t}">#${t}</button>`).join("");

  let activeTag = null;

  chipWrap.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-tag]"); if(!b) return;
    const t = b.getAttribute("data-tag");
    activeTag = (activeTag === t) ? null : t;
    chipWrap.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active", x.getAttribute("data-tag")===activeTag));
    render();
  });

  function match(p){
    const q = (search.value||"").trim().toLowerCase();
    if(q){
      const hay = (p.title+" "+p.excerpt+" "+p.tags.join(" ")+" "+p.category).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    if(select.value && p.category !== select.value) return false;
    if(activeTag && !p.tags.includes(activeTag)) return false;
    return true;
  }

  function card(p){
    return `
      <article class="card">
        <div class="card-body">
          <div class="meta">${p.date} · ${p.category}</div>
          <h2><a href="./post/${p.slug}/">${p.title}</a></h2>
          <p class="excerpt">${p.excerpt}</p>
        </div>
        <div class="card-footer">
          <div class="tagrow">${p.tags.map(t=>`<span class="tag">#${t}</span>`).join("")}</div>
          <a class="read" href="./post/${p.slug}/">閱讀 →</a>
        </div>
      </article>`;
  }

  function render(){
    const filtered = posts.filter(match);
    count.textContent = filtered.length;
    grid.innerHTML = filtered.map(card).join("");
  }

  search.addEventListener("input", render);
  select.addEventListener("change", render);
  window.addEventListener("keydown", (e)=>{
    if(e.key === "/" && document.activeElement !== search){
      e.preventDefault(); search.focus();
    }
  });

  render();
}
document.addEventListener("DOMContentLoaded", initSearch);
