const fs   = require('fs');
const path = require('path');

// Load items data
const itemsSrc = fs.readFileSync(path.join(__dirname, '../learning/items.js'), 'utf8');
eval(itemsSrc); // exposes allItems

const ROOT = path.join(__dirname, '..');
const TODAY = '2026-05-06';

// Items whose id doesn't make a clean URL slug
const slugOverride = { 'bodyweight-hydration': 'daily-water-target' };

const specialtyOverride = {
  'daily-fiber-target':   'https://schema.org/Nutrition',
  'gut-health':           'https://schema.org/Gastroenterologic',
  'apple-cider-vinegar':  'https://schema.org/Gastroenterologic',
  'progressive-overload': 'https://schema.org/PhysicalTherapy',
  'workout-essentials':   'https://schema.org/PhysicalTherapy',
};
const specialtyByTopic = {
  supplements:      'https://schema.org/Physiotherapy',
  health:           'https://schema.org/Physiotherapy',
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slug(item)      { return slugOverride[item.id] || item.id; }
function specialty(item) { return specialtyOverride[item.id] || specialtyByTopic[item.topic] || 'https://schema.org/Physiotherapy'; }

function metaDesc(item) {
  const first = item.desc.split('\n\n')[0].replace(/\n/g, ' ');
  return first.length > 155 ? first.slice(0, 152) + '...' : first;
}

function renderDesc(desc) {
  const blocks = desc.split('\n\n');
  let html = '';
  blocks.forEach((block, idx) => {
    const lines       = block.split('\n');
    const bullets     = lines.filter(l => l.trimLeft().startsWith('•'));
    const nonBullets  = lines.filter(l => !l.trimLeft().startsWith('•'));
    const headerText  = nonBullets.join(' ').trim();

    if (bullets.length) {
      const rows = bullets.map((b, bi) => {
        const text  = b.replace(/^\s*•\s*/, '');
        const colon = text.indexOf(':');
        let inner;
        if (colon > 0 && colon < 50) {
          inner = `<p class="item-bullet-title">${esc(text.slice(0, colon))}</p>`
                + `<p class="item-bullet-body">${esc(text.slice(colon + 1).trim())}</p>`;
        } else {
          inner = `<p class="item-bullet-body">${esc(text)}</p>`;
        }
        return `<div class="item-bullet${bi ? ' item-bullet-sep' : ''}">${inner}</div>`;
      }).join('');
      html += `<div class="item-section">${headerText ? `<p class="item-section-label">${esc(headerText)}</p>` : ''}${rows}</div>`;
    } else if (idx === 0) {
      html += `<p class="item-intro">${esc(headerText)}</p>`;
    } else {
      const colon = headerText.indexOf(':');
      if (colon > 0 && colon < 60) {
        html += `<div class="item-section">`
              + `<p class="item-section-label">${esc(headerText.slice(0, colon))}</p>`
              + `<p class="item-section-text">${esc(headerText.slice(colon + 1).trim())}</p>`
              + `</div>`;
      } else {
        html += `<div class="item-section"><p class="item-section-text">${esc(headerText)}</p></div>`;
      }
    }
  });
  return html;
}

function buildPage(item) {
  const s    = slug(item);
  const url  = `https://sarx.app/learning/${s}/`;
  const desc = metaDesc(item);

  const evLabel = item.evidence === 'high' ? 'HIGH EVIDENCE' : item.evidence === 'medium' ? 'MED EVIDENCE' : 'TREND';
  let badges = '';
  if (item.sarxPick) badges += `<span class="item-badge item-badge-pick">SARX PICK</span>`;
  if (item.trend)    badges += `<span class="item-badge item-badge-trend">TREND WARNING</span>`;
  badges += `<span class="item-badge topic-evidence evidence-${item.evidence}"><span class="topic-evidence-dot"></span>${evLabel}</span>`;

  let dosage = '';
  if (item.dosage || item.when) {
    dosage = `<div class="item-dosage-card">`
      + (item.dosage ? `<div class="item-dosage-cell"><span class="item-dosage-label">DOSE</span><span class="item-dosage-value">${esc(item.dosage)}</span></div>` : '')
      + (item.when   ? `<div class="item-dosage-cell"><span class="item-dosage-label">TIMING</span><span class="item-dosage-value">${esc(item.when)}</span></div>` : '')
      + `</div>`;
  }

  const trendWarn = item.trend
    ? `<div class="item-trend-warning"><strong>Trend Warning:</strong> This is currently popular online but has limited or mixed clinical evidence. Use caution before adding it to your routine.</div>`
    : '';

  const schemaArticle = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    "headline": item.title,
    "description": desc,
    "url": url,
    "datePublished": "2026-04-25",
    "dateModified": TODAY,
    "inLanguage": "en-US",
    "author": { "@type": "Person", "name": "Chaisson Cook", "url": "https://chaissoncook.com" },
    "publisher": { "@type": "Organization", "@id": "https://sarx.app/#organization", "name": "Sarx", "url": "https://sarx.app" },
    "mainEntityOfPage": { "@type": "MedicalWebPage", "@id": url, "specialty": specialty(item) },
    "image": { "@type": "ImageObject", "url": "https://sarx.app/assets/socialImage.png" }
  }, null, 2);

  const schemaCrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Sarx",  "item": "https://sarx.app" },
      { "@type": "ListItem", "position": 2, "name": "Learn", "item": "https://sarx.app/learning/" },
      { "@type": "ListItem", "position": 3, "name": item.title, "item": url }
    ]
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(item.title)} — ${esc(item.topicLabel)} | Sarx</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(item.title)} — Sarx">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="https://sarx.app/assets/socialImage.png">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(item.title)} — Sarx">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image:alt" content="Sarx — ${esc(item.title)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap"></noscript>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/icon.png">
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/learning/style.css">
  <link rel="stylesheet" href="/learning/item/item.css">
  <script type="application/ld+json">
  ${schemaArticle}
  </script>
  <script type="application/ld+json">
  ${schemaCrumb}
  </script>
</head>
<body>
<div class="app">
  <div class="screen active">

    <div class="topic-nav">
      <a href="/learning/" class="topic-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        Learn
      </a>
      <span class="topic-nav-spacer"></span>
    </div>

    <p class="section-tag">${esc(item.topicLabel.toUpperCase())}</p>
    <div class="item-header">
      <span class="item-emoji">${item.emoji}</span>
      <h1 class="screen-title" style="margin-bottom:8px">${esc(item.title)}</h1>
    </div>
    <div class="item-badges">${badges}</div>
    ${dosage}
    ${trendWarn}
    <div class="item-body">${renderDesc(item.desc)}</div>
    <p class="item-byline">Written by <a href="https://chaissoncook.com">Chaisson Cook</a></p>
    <p class="item-disclaimer">This content is for informational purposes only and does not constitute medical advice. Consult a qualified healthcare provider before making health decisions.</p>

  </div>

  <nav class="tab-bar">
    <a class="tab-item" href="/healthindex/">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <rect x="3" y="13" width="4" height="8" rx="1"/>
        <rect x="10" y="8" width="4" height="13" rx="1"/>
        <rect x="17" y="3" width="4" height="18" rx="1"/>
      </svg>
      <span>Index</span>
    </a>
    <a class="tab-item" href="/plan/">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/>
      </svg>
      <span>Plan</span>
    </a>
    <a class="tab-item active" href="/learning/">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M12 3 4 7v13l8-4 8 4V7L12 3zm6 17-6-3-6 3V8.5l6-3 6 3V20z"/>
      </svg>
      <span>Learn</span>
    </a>
  </nav>
</div>
<script src="/js/pwa.js"></script>
</body>
</html>`;
}

// Generate all pages
allItems.forEach(item => {
  const s   = slug(item);
  const dir = path.join(ROOT, 'learning', s);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(item), 'utf8');
  console.log(`  ✓  /learning/${s}/`);
});

console.log(`\nGenerated ${allItems.length} pages.`);
