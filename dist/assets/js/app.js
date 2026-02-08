(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Mobile nav
  const toggle = $('[data-nav-toggle]');
  const panel = $('[data-nav-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', (!expanded).toString());
      panel.style.display = expanded ? 'none' : 'block';
    });
    // default closed
    panel.style.display = 'none';
  }

  const parseJson = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    try { return JSON.parse(el.textContent || 'null'); } catch { return null; }
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    return iso;
  };

  const renderMenuCards = (menu, mountSel) => {
    const mount = $(mountSel);
    if (!mount || !Array.isArray(menu)) return;
    mount.innerHTML = menu.map(m => `
      <a class="route-card" href="${m.path}">
        <div class="route-top">
          <div class="route-title">${m.title}</div>
          <div class="route-emoji" aria-hidden="true">${m.icon}</div>
        </div>
        <div class="route-desc">${m.desc}</div>
        <div class="route-meta">
          <span class="pill">前往路線</span>
          <span class="pill">至少 2 篇</span>
        </div>
      </a>
    `).join('');
  };

  const postCard = (p) => `
    <a class="post-card" href="/post/${p.slug}/">
      <div class="kicker">${fmtDate(p.date)} · <span class="pill" style="padding:4px 10px;">${p.category}</span></div>
      <div class="title">${p.title}</div>
      <div class="excerpt">${p.excerpt || ''}</div>
      <div class="meta">
        <span class="pill">路線：${p.section || '—'}</span>
        <span class="pill">看同分類 →</span>
      </div>
    </a>
  `;

  const postToolCard = (p) => `
    <a class="post-card" href="/post/${p.slug}/">
      <div class="kicker">🧰 ${fmtDate(p.date)} · ${p.category}</div>
      <div class="title">${p.title}</div>
      <div class="excerpt">${p.excerpt || ''}</div>
      <div class="meta">
        <span class="pill">適用新手</span>
        <span class="pill">快速上手</span>
      </div>
    </a>
  `;

  const postRow = (p) => `
    <div class="post-row">
      <div class="left">
        <a class="title" href="/post/${p.slug}/">${p.title}</a>
        <div class="sub">${fmtDate(p.date)} · <a href="/category/${p.category_slug || ''}/">${p.category}</a> · 路線：<a href="/${p.section || ''}/">${p.section || '—'}</a></div>
      </div>
      <div class="right">
        ${(p.tags || []).slice(0, 3).map(t => `<a class="pill" href="/tag/${slugAscii(t)}/">#${escapeHtml(t)}</a>`).join('')}
        <a class="pill" href="/category/${p.category_slug || ''}/">同分類</a>
      </div>
    </div>
  `;

  const escapeHtml = (s) => (s ?? '').toString()
    .replace(/&/g, '&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');

  const slugAscii = (s) => (s ?? '').toString().toLowerCase().trim()
    .normalize('NFKD')
    .replace(/['"]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/-+/g,'-')
    .replace(/^-|-$/g,'') || ('tag-' + hash10(String(s)));

  const hash10 = (s) => {
    let h = 2166136261;
    for (let i=0;i<s.length;i++){
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h>>>0).toString(16).padStart(8,'0').slice(0,10);
  };

  const renderPostsGrid = (posts, mountSel, variant='default') => {
    const mount = $(mountSel);
    if (!mount || !Array.isArray(posts)) return;
    const cardFn = variant === 'tools' ? postToolCard : postCard;
    mount.innerHTML = posts.map(cardFn).join('');
  };

  const renderPostsList = (posts, mountSel) => {
    const mount = $(mountSel);
    if (!mount || !Array.isArray(posts)) return;
    mount.innerHTML = posts.map(postRow).join('');
  };

  const renderCatsRail = (cats, mountSel) => {
    const mount = $(mountSel);
    if (!mount || !Array.isArray(cats)) return;
    mount.innerHTML = cats
      .filter(c => (c.count ?? 0) > 0)
      .slice(0, 10)
      .map(c => `
        <a class="cat-item" href="/category/${c.slug}/">
          <div class="l">
            <div class="t">${c.name || c.tag}</div>
            <div class="s">沿著主題讀下去</div>
          </div>
          <div class="c">${c.count} 篇</div>
        </a>
      `).join('');
  };

  const renderCatCards = (cats, mountSel) => {
    const mount = $(mountSel);
    if (!mount || !Array.isArray(cats)) return;
    mount.innerHTML = cats
      .filter(c => (c.count ?? 0) > 0)
      .map(c => `
        <a class="cat-card" href="/category/${c.slug}/">
          <div class="t">${c.name || c.tag}</div>
          <div class="d">把同一類問題集中起來，讀完你會更有「主題感」。</div>
          <div class="b">
            <span class="pill">進入分類</span>
            <span>${c.count} 篇</span>
          </div>
        </a>
      `).join('');
  };

  const renderTaxGrid = (items) => {
    const mount = $('#taxGrid');
    if (!mount || !Array.isArray(items)) return;
    const kind = window.__TAX_KIND__ || 'tag';
    const base = kind === 'category' ? '/category/' : '/tag/';
    mount.innerHTML = items.map(it => `
      <a class="tax-item" href="${base}${it.slug}/">
        <div class="t">${it.tag}</div>
        <div class="c">${it.count} 篇</div>
      </a>
    `).join('');
  };

  // Home
  const homePosts = parseJson('postsJson');
  const menu = parseJson('menuJson');
  const cats = parseJson('catsJson');

  if (homePosts && $('#postGrid')) {
    renderPostsGrid(homePosts, '#postGrid');
    renderMenuCards(menu, '#menuCards');
    renderCatsRail(cats, '#catList');

    const input = $('#searchInput');
    const empty = $('#emptyState');
    const chips = $$('.chip');
    const full = homePosts;

    const filter = (q) => {
      const s = (q || '').toLowerCase().trim();
      const out = !s ? full : full.filter(p => {
        const hay = [
          p.title, p.excerpt, p.category,
          (p.tags || []).join(' '),
          p.section
        ].join(' ').toLowerCase();
        return hay.includes(s);
      });
      renderPostsGrid(out, '#postGrid');
      if (empty) empty.hidden = out.length !== 0;
    };

    if (input) input.addEventListener('input', (e) => filter(e.target.value));
    chips.forEach(ch => ch.addEventListener('click', () => {
      const val = ch.getAttribute('data-chip') || '';
      if (input) input.value = val;
      filter(val);
    }));
  }

  // About
  if ($('#menuCards') && menu && !homePosts) renderMenuCards(menu, '#menuCards');
  if ($('#catCards') && cats && !homePosts) renderCatCards(cats, '#catCards');

  // Section pages
  const sectionPosts = parseJson('postsJson');
  const sectionCats = parseJson('catsJson');
  if (sectionPosts && $('#postGrid')) renderPostsGrid(sectionPosts, '#postGrid');
  if (sectionPosts && $('#toolGrid')) renderPostsGrid(sectionPosts, '#toolGrid', 'tools');
  if (sectionPosts && $('#postList')) renderPostsList(sectionPosts, '#postList');
  if (sectionCats && $('#catCards')) renderCatCards(sectionCats, '#catCards');

  // Tax pages
  const items = parseJson('itemsJson');
  if (items) renderTaxGrid(items);

})();