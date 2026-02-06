import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const SITE = {
  name: "Aurora Orbit",
  tagline: "把踩坑寫成文章，讓 Google 幫你帶人進站。",
  description: "獨一無二的技術雜誌站：錯誤訊息解法、新手流程、工具比較與變現策略。",
  // ✅ 修正：改成你的真實網址（不要用 YOURNAME）
  url: "https://buildwithlegend.github.io",
  base: "/"
};

const root = process.cwd();
const contentDir = path.join(root, "content", "posts");
const dist = path.join(root, "dist");
const templatesDir = path.join(root, "templates");
const assetsDir = path.join(root, "assets");

const read = (p) => fs.readFileSync(p, "utf-8");
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s, "utf-8"); };
const copyDir = (src, dst) => {
  if(!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};
const isoToday = () => new Date().toISOString().slice(0,10);
const escapeHtml = (s) => (s??"").toString().replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));

const slugify = (s) => (s??"")
  .toString().toLowerCase().trim()
  .replace(/[\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,./:;<=>?@[\\\]^`{|}~]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

function render(templateName, vars){
  let tpl = read(path.join(templatesDir, templateName));
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ""));
}

function canonical(urlPath){
  const base = SITE.base.endsWith("/") ? SITE.base : SITE.base + "/";
  const u = SITE.url.replace(/\/$/,"");
  const p = (urlPath.startsWith("/") ? urlPath : "/" + urlPath).replace(/\/{2,}/g,"/");
  return u + base.replace(/\/$/,"") + p;
}

function articleJsonLd(post, url){
  const data = {
    "@context":"https://schema.org",
    "@type":"BlogPosting",
    "headline": post.title,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": { "@type":"Person", "name": post.author || "Legend" }, // ✅ 可選：把預設作者改成你（可自行改名）
    "publisher": { "@type":"Organization", "name": SITE.name },
    "mainEntityOfPage": url,
    "description": post.excerpt || SITE.description
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function buildTOC(html){
  const re = /<(h2|h3) id="([^"]+)">([^<]+)<\/\1>/g;
  const items = [];
  let m;
  while((m = re.exec(html))){
    items.push({ level: m[1], id: m[2], text: m[3] });
  }
  if(!items.length) return "";
  const links = items.map(it => `<a class="toc-link ${it.level}" href="#${it.id}">${escapeHtml(it.text)}</a>`).join("");
  return `<div class="toc"><b>目錄</b>${links}</div>`;
}

function ensureCleanDist(){
  fs.rmSync(dist, { recursive:true, force:true });
  fs.mkdirSync(dist, { recursive:true });
}

function readPosts(){
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".md"));
  const posts = files.map(file => {
    const raw = read(path.join(contentDir, file));
    const fm = matter(raw);
    const data = fm.data || {};
    const body = fm.content || "";
    const title = data.title || file.replace(/\.md$/,"");
    const slug = data.slug || slugify(title);
    const date = (data.date || isoToday()).toString().slice(0,10);
    const category = data.category || "未分類";
    const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [String(data.tags)] : []);
    const excerpt = data.excerpt || body.split("\n").find(l => l.trim())?.slice(0, 120) || "";
    return { file, title, slug, date, category, tags, excerpt, author: data.author };
  }).sort((a,b)=> a.date < b.date ? 1 : -1);
  return posts;
}

function markedWithIds(md){
  const renderer = new marked.Renderer();
  renderer.heading = function(text, level, raw){
    const id = slugify(raw);
    return `<h${level} id="${id}">${text}</h${level}>`;
  };
  marked.setOptions({ renderer, mangle:false, headerIds:false });
  return marked.parse(md);
}

function build(){
  ensureCleanDist();
  copyDir(assetsDir, path.join(dist, "assets"));

  const theme = read(path.join(templatesDir, "theme.html"));
  const posts = readPosts();
  const tags = Array.from(new Set(posts.flatMap(p=>p.tags))).sort((a,b)=>a.localeCompare(b,"zh-Hant"));
  const categories = Array.from(new Set(posts.map(p=>p.category))).sort((a,b)=>a.localeCompare(b,"zh-Hant"));
  const firstSlug = posts[0]?.slug || "";

  write(path.join(dist, "index.html"), render("home.html", {
    SITE_NAME: SITE.name,
    TAGLINE: SITE.tagline,
    DESC: SITE.description,
    POSTS_JSON: JSON.stringify(posts),
    TAGS_JSON: JSON.stringify(tags),
    CATS_JSON: JSON.stringify(categories),
    FIRST_SLUG: firstSlug,
    CANONICAL: canonical("/"),
    THEME: theme
  }));

  write(path.join(dist, "about", "index.html"), render("about.html", {
    SITE_NAME: SITE.name,
    CANONICAL: canonical("/about/"),
    THEME: theme
  }));

  for (const p of posts){
    const mdRaw = read(path.join(contentDir, p.file));
    const fm = matter(mdRaw);
    const htmlBody = markedWithIds(fm.content || "");
    const toc = buildTOC(htmlBody);
    const urlPath = `/post/${p.slug}/`;
    const url = canonical(urlPath);

    write(path.join(dist, "post", p.slug, "index.html"), render("post.html", {
      SITE_NAME: SITE.name,
      TITLE: escapeHtml(p.title),
      META: escapeHtml(`${p.date} · ${p.category} · ${p.tags.map(t=>"#"+t).join(" ")}`),
      BODY: htmlBody,
      TOC: toc,
      JSON_LD: articleJsonLd(p, url),
      CANONICAL: url,
      THEME: theme
    }));
  }

  const tagIndex = tags.map(t => ({ tag:t, count: posts.filter(p=>p.tags.includes(t)).length }))
                       .sort((a,b)=>b.count-a.count);
  write(path.join(dist, "tags", "index.html"), render("tax-index.html", {
    SITE_NAME: SITE.name,
    TITLE: "標籤",
    ITEMS_JSON: JSON.stringify(tagIndex),
    KIND: "tag",
    CANONICAL: canonical("/tags/"),
    THEME: theme
  }));
  for(const t of tags){
    const list = posts.filter(p=>p.tags.includes(t));
    write(path.join(dist, "tag", slugify(t), "index.html"), render("tax-list.html", {
      SITE_NAME: SITE.name,
      TITLE: `#${escapeHtml(t)}`,
      POSTS_JSON: JSON.stringify(list),
      CANONICAL: canonical(`/tag/${slugify(t)}/`),
      THEME: theme
    }));
  }

  const catIndex = categories.map(c => ({ tag:c, count: posts.filter(p=>p.category===c).length }))
                             .sort((a,b)=>b.count-a.count);
  write(path.join(dist, "categories", "index.html"), render("tax-index.html", {
    SITE_NAME: SITE.name,
    TITLE: "分類",
    ITEMS_JSON: JSON.stringify(catIndex),
    KIND: "category",
    CANONICAL: canonical("/categories/"),
    THEME: theme
  }));
  for(const c of categories){
    const list = posts.filter(p=>p.category===c);
    write(path.join(dist, "category", slugify(c), "index.html"), render("tax-list.html", {
      SITE_NAME: SITE.name,
      TITLE: escapeHtml(c),
      POSTS_JSON: JSON.stringify(list),
      CANONICAL: canonical(`/category/${slugify(c)}/`),
      THEME: theme
    }));
  }

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
  write(path.join(dist, "rss.xml"), rss);

  const urls = [
    { loc: canonical("/"), lastmod: isoToday() },
    { loc: canonical("/about/"), lastmod: isoToday() },
    { loc: canonical("/tags/"), lastmod: isoToday() },
    { loc: canonical("/categories/"), lastmod: isoToday() },
    ...posts.map(p => ({ loc: canonical(`/post/${p.slug}/`), lastmod: p.date })),
    ...tags.map(t => ({ loc: canonical(`/tag/${slugify(t)}/`), lastmod: isoToday() })),
    ...categories.map(c => ({ loc: canonical(`/category/${slugify(c)}/`), lastmod: isoToday() }))
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}
</urlset>`;
  write(path.join(dist, "sitemap.xml"), sitemap);

  write(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${canonical("/sitemap.xml")}\n`);

  console.log(`Built ${posts.length} posts → dist/`);
}

build();
