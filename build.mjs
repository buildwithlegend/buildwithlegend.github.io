import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Aurora Orbit SSG (simple, dependency-light)
 * - content/posts/*.md (YAML frontmatter required)
 * - templates/*.html ({{VARS}} replacement)
 * - outputs to /dist
 */

const SITE = {
  name: "Aurora Orbit",
  tagline: "把踩坑寫成文章，讓 Google 幫你帶人進站。",
  description: "溫暖但專業的技術雜誌：新手入門、錯誤排除、工具推薦、後端實作、成長變現。",
  url: "https://buildwithlegend.github.io",
  base: "/"
};

// Top nav + section pages (each section MUST have >=2 posts)
const MENU = [
  {
    id: "start",
    title: "新手入門",
    path: "/start/",
    template: "landing-start.html",
    desc: "從 0 到 1：觀念、工具、第一個流程。",
    icon: "🌱"
  },
  {
    id: "fix",
    title: "錯誤排除",
    path: "/fix/",
    template: "landing-fix.html",
    desc: "把錯誤訊息翻成白話，給你可複製的解法。",
    icon: "🧯"
  },
  {
    id: "tools",
    title: "開發工具",
    path: "/tools/",
    template: "landing-tools.html",
    desc: "VS Code、Postman…挑對工具少走很多彎路。",
    icon: "🧰"
  },
  {
    id: "backend",
    title: "後端實作",
    path: "/backend/",
    template: "landing-backend.html",
    desc: "Spring Boot / Java：能跑起來、能部署、能解釋。",
    icon: "🛠️"
  },
  {
    id: "growth",
    title: "成長變現",
    path: "/growth/",
    template: "landing-growth.html",
    desc: "把技術寫成資產：作品集、SEO、接案與職涯。",
    icon: "📈"
  }
];

const CATEGORY_DEFS = [
  { slug: "newbie", name: "新手必看", section: "start", blurb: "零基礎也能跟上的基礎觀念與流程。" },
  { slug: "troubleshooting", name: "錯誤排除", section: "fix", blurb: "常見錯誤訊息 → 原因 → 具體解法。" },
  { slug: "dev-tools", name: "工具推薦", section: "tools", blurb: "用對工具：效率、品質、心情都會更好。" },
  { slug: "spring-java", name: "Spring / Java", section: "backend", blurb: "後端入門到實作：能跑、能懂、能調。" },
  { slug: "growth", name: "成長與變現", section: "growth", blurb: "把文章、作品與經驗變成長期收益。" }
];

const root = process.cwd();
const contentDir = path.join(root, "content", "posts");
const distDir = path.join(root, "dist");
const templatesDir = path.join(root, "templates");
const assetsDir = path.join(root, "assets");

const read = (p) => fs.readFileSync(p, "utf-8");
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s, "utf-8");
};

const copyDir = (src, dst) => {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};

const isoToday = () => new Date().toISOString().slice(0, 10);
const escapeHtml = (s) =>
  (s ?? "").toString().replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[m]));

const slugifyAscii = (s) => {
  const cleaned = (s ?? "")
    .toString()
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned;
};

const stableSlug = (s, prefix = "x") => {
  const ascii = slugifyAscii(s);
  if (ascii) return ascii;
  const h = crypto.createHash("sha1").update(String(s)).digest("hex").slice(0, 10);
  return `${prefix}-${h}`;
};

function render(templateName, vars) {
  const tpl = read(path.join(templatesDir, templateName));
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ""));
}

function canonical(urlPath) {
  const base = SITE.base.endsWith("/") ? SITE.base : SITE.base + "/";
  const u = SITE.url.replace(/\/$/, "");
  const p = (urlPath.startsWith("/") ? urlPath : "/" + urlPath).replace(/\/{2,}/g, "/");
  return u + base.replace(/\/$/, "") + p;
}

function markedWithIds(md) {
  const renderer = new marked.Renderer();
  renderer.heading = function (text, level, raw) {
    const id = stableSlug(raw, "h");
    return `<h${level} id="${id}">${text}</h${level}>`;
  };
  marked.setOptions({ renderer, mangle: false, headerIds: false });
  return marked.parse(md);
}

function buildTOC(html) {
  const regex = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  const items = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    const level = Number(m[1]);
    const id = m[2];
    const title = m[3].replace(/<[^>]+>/g, "").trim();
    items.push({ level, id, title });
  }
  if (!items.length) return "";
  return `
    <div class="toc">
      <div class="toc-title">本頁快速導航</div>
      <ul>
        ${items.map(it => `<li class="l${it.level}"><a href="#${it.id}">${escapeHtml(it.title)}</a></li>`).join("")}
      </ul>
    </div>`;
}

function readPosts() {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".md"));
  const posts = files.map(file => {
    const raw = read(path.join(contentDir, file));
    const fm = matter(raw);
    const data = fm.data || {};
    const body = fm.content || "";

    const title = String(data.title || file.replace(/\.md$/, ""));
    const date = String(data.date || isoToday()).slice(0, 10);

    const category = String(data.category || "未分類");
    const category_slug = String(data.category_slug || data.categorySlug || stableSlug(category, "cat"));

    const section = String(data.section || "").trim();
    const tags = Array.isArray(data.tags) ? data.tags.map(String) : (data.tags ? [String(data.tags)] : []);

    const excerpt =
      String(data.excerpt || "").trim() ||
      body.split("\n").find(l => l.trim())?.trim().slice(0, 140) ||
      "";

    const views = Number(data.views ?? 0) || 0;
    const slug = String(data.slug || stableSlug(title, "post"));

    return {
      file, title, slug, date,
      category, category_slug,
      section, tags, excerpt, views
    };
  }).sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

function ensureCleanDist() {
  if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

function requireTwoPostsPerMenu(posts) {
  for (const m of MENU) {
    const n = posts.filter(p => p.section === m.id).length;
    if (n < 2) {
      throw new Error(`Menu "${m.id}" must have at least 2 posts. Current: ${n}`);
    }
  }
}

function build() {
  ensureCleanDist();
  copyDir(assetsDir, path.join(distDir, "assets"));

  const posts = readPosts();
  requireTwoPostsPerMenu(posts);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort((a, b) => a.localeCompare(b, "zh-Hant"));

  const categories = (() => {
    const map = new Map();
    for (const p of posts) {
      if (!map.has(p.category_slug)) {
        map.set(p.category_slug, { slug: p.category_slug, name: p.category, count: 0, section: p.section });
      }
      map.get(p.category_slug).count += 1;
    }
    // enrich with defs
    for (const def of CATEGORY_DEFS) {
      if (!map.has(def.slug)) map.set(def.slug, { slug: def.slug, name: def.name, count: 0, section: def.section });
      else map.get(def.slug).name = def.name; // prefer def name
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  })();

  const navItemsHtml = MENU.map(m => `<a class="nav-link" href="${m.path}"><span class="nav-emoji">${m.icon}</span>${m.title}</a>`).join("");

  const layout = (pageTitle, pageDesc, bodyClass, contentHtml, canonicalPath) =>
    render("theme.html", {
      SITE_NAME: SITE.name,
      SITE_TAGLINE: SITE.tagline,
      SITE_DESC: SITE.description,
      PAGE_TITLE: escapeHtml(pageTitle),
      PAGE_DESC: escapeHtml(pageDesc || SITE.description),
      BODY_CLASS: bodyClass,
      NAV_ITEMS: navItemsHtml,
      CANONICAL: canonical(canonicalPath),
      CONTENT: contentHtml
    });

  // Home: popular first (views), fallback newest
  const popular = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
  const homePosts = popular.some(p => p.views > 0) ? popular.slice(0, 12) : posts.slice(0, 12);

  write(path.join(distDir, "index.html"),
    layout(
      SITE.name,
      SITE.description,
      "page-home",
      render("home.html", {
        POSTS_JSON: JSON.stringify(homePosts),
        MENU_JSON: JSON.stringify(MENU),
        CATS_JSON: JSON.stringify(categories)
      }),
      "/"
    )
  );

  // Section pages (each has its own template)
  for (const m of MENU) {
    const list = posts.filter(p => p.section === m.id);
    const catForSection = categories.filter(c => c.section === m.id && c.count > 0);
    const content = render(m.template, {
      TITLE: escapeHtml(m.title),
      DESC: escapeHtml(m.desc),
      ICON: m.icon,
      POSTS_JSON: JSON.stringify(list),
      CATS_JSON: JSON.stringify(catForSection)
    });
    write(path.join(distDir, m.id, "index.html"),
      layout(
        `${m.title}｜${SITE.name}`,
        m.desc,
        `page-section page-${m.id}`,
        content,
        m.path
      )
    );
  }

  // About
  write(path.join(distDir, "about", "index.html"),
    layout(
      `關於｜${SITE.name}`,
      "這個網站的寫作方式與你可以怎麼用它。",
      "page-about",
      render("about.html", { MENU_JSON: JSON.stringify(MENU), CATS_JSON: JSON.stringify(categories) }),
      "/about/"
    )
  );

  // Posts
  for (const p of posts) {
    const mdRaw = read(path.join(contentDir, p.file));
    const fm = matter(mdRaw);
    const htmlBody = markedWithIds(fm.content || "");
    const toc = buildTOC(htmlBody);

    const urlPath = `/post/${p.slug}/`;
    const url = canonical(urlPath);

    const postContent = render("post.html", {
      TITLE: escapeHtml(p.title),
      DATE: escapeHtml(p.date),
      CATEGORY: escapeHtml(p.category),
      CATEGORY_SLUG: escapeHtml(p.category_slug),
      SECTION_PATH: escapeHtml("/" + (p.section || "categories") + "/"),
      SECTION_TITLE: escapeHtml((MENU.find(x => x.id === p.section)?.title) || "分類"),
      TAGS_HTML: p.tags.map(t => `<a class="pill" href="/tag/${stableSlug(t, "tag")}/">#${escapeHtml(t)}</a>`).join(""),
      TOC: toc,
      BODY: htmlBody
    });

    write(path.join(distDir, "post", p.slug, "index.html"),
      layout(
        `${p.title}｜${SITE.name}`,
        p.excerpt || SITE.description,
        "page-post",
        postContent,
        urlPath
      )
    );
  }

  // Taxonomy: tags
  const tagIndex = allTags
    .map(t => ({ tag: t, slug: stableSlug(t, "tag"), count: posts.filter(p => p.tags.includes(t)).length }))
    .sort((a, b) => b.count - a.count);

  write(path.join(distDir, "tags", "index.html"),
    layout(
      `標籤｜${SITE.name}`,
      "用主題快速篩選文章。",
      "page-tax page-tags",
      render("tax-index.html", { TITLE: "標籤", KIND: "tag", ITEMS_JSON: JSON.stringify(tagIndex) }),
      "/tags/"
    )
  );

  for (const t of tagIndex) {
    const list = posts.filter(p => p.tags.includes(t.tag));
    write(path.join(distDir, "tag", t.slug, "index.html"),
      layout(
        `#${t.tag}｜${SITE.name}`,
        `標籤：${t.tag}`,
        "page-tax page-tag",
        render("tax-list.html", { TITLE: `#${escapeHtml(t.tag)}`, POSTS_JSON: JSON.stringify(list) }),
        `/tag/${t.slug}/`
      )
    );
  }

  // Taxonomy: categories
  write(path.join(distDir, "categories", "index.html"),
    layout(
      `分類｜${SITE.name}`,
      "每個分類都是一條可跟的學習路線。",
      "page-tax page-categories",
      render("tax-index.html", { TITLE: "分類", KIND: "category", ITEMS_JSON: JSON.stringify(categories.map(c => ({ tag: c.name, slug: c.slug, count: c.count, section: c.section }))) }),
      "/categories/"
    )
  );

  for (const c of categories) {
    const list = posts.filter(p => p.category_slug === c.slug);
    write(path.join(distDir, "category", c.slug, "index.html"),
      layout(
        `${c.name}｜${SITE.name}`,
        `分類：${c.name}`,
        "page-tax page-category",
        render("tax-list.html", { TITLE: escapeHtml(c.name), POSTS_JSON: JSON.stringify(list) }),
        `/category/${c.slug}/`
      )
    );
  }

  // robots
  write(path.join(distDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${canonical("/sitemap.xml")}\n`);

  // RSS
  const rssItems = posts.slice(0, 20).map(p => {
    const link = canonical(`/post/${p.slug}/`);
    return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${new Date(p.date + "T08:00:00Z").toUTCString()}</pubDate>
        <description><![CDATA[${p.excerpt || ""}]]></description>
      </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${SITE.name}]]></title>
    <link>${SITE.url}</link>
    <description><![CDATA[${SITE.description}]]></description>
    <language>zh-TW</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;
  write(path.join(distDir, "rss.xml"), rss);

  // Sitemap
  const urls = [
    { loc: canonical("/"), lastmod: isoToday() },
    ...MENU.map(m => ({ loc: canonical(m.path), lastmod: isoToday() })),
    { loc: canonical("/about/"), lastmod: isoToday() },
    { loc: canonical("/tags/"), lastmod: isoToday() },
    { loc: canonical("/categories/"), lastmod: isoToday() },
    ...posts.map(p => ({ loc: canonical(`/post/${p.slug}/`), lastmod: p.date })),
    ...tagIndex.map(t => ({ loc: canonical(`/tag/${t.slug}/`), lastmod: isoToday() })),
    ...categories.map(c => ({ loc: canonical(`/category/${c.slug}/`), lastmod: isoToday() }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n  ")}
</urlset>`;
  write(path.join(distDir, "sitemap.xml"), sitemap);
}

build();
console.log("✅ Build complete → dist/");