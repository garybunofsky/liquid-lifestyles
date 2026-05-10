// One-time refactor: remove inline <style> + Tailwind CDN script + tailwind.config script,
// and inject a single <link rel="stylesheet" href="css/styles.css"> + data-theme on <body>.
// Run: node scripts/strip-inline.js

const fs = require('fs');
const path = require('path');

const themes = {
  'index.html': null,
  'locations.html': null,
  'faqs.html': 'faqs',
  'find-your-class.html': 'find-your-class',
  'baby-bubbles.html': 'baby-bubbles',
  'liquid-bubbles.html': 'liquid-bubbles',
  'liquid-medals.html': 'liquid-medals',
  'private-lessons.html': 'private-lessons',
  'adult-programs.html': 'adult-programs',
};

Object.entries(themes).forEach(([file, theme]) => {
  const p = path.join(__dirname, '..', file);
  if (!fs.existsSync(p)) {
    console.log(`skip ${file} (not found)`);
    return;
  }

  let html = fs.readFileSync(p, 'utf8');

  // Remove the inline <style>...</style> block immediately following <title>.
  html = html.replace(/<style>[\s\S]*?<\/style>\s*/m, '');

  // Remove Tailwind CDN script tag.
  html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g, '');

  // Remove the inline tailwind.config <script>...</script> block.
  html = html.replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>\s*/m, '');

  // Inject our compiled stylesheet just before </head> (only if not already present).
  if (!/href="css\/styles\.css"/.test(html)) {
    html = html.replace(/<\/head>/, '<link rel="stylesheet" href="css/styles.css" />\n</head>');
  }

  // Add or replace data-theme on body.
  if (theme) {
    if (/<body[^>]*data-theme=/.test(html)) {
      html = html.replace(/<body([^>]*?)data-theme="[^"]*"([^>]*)>/, `<body$1data-theme="${theme}"$2>`);
    } else {
      html = html.replace(/<body/, `<body data-theme="${theme}"`);
    }
  }

  fs.writeFileSync(p, html);
  console.log(`updated ${file}${theme ? ` (data-theme="${theme}")` : ''}`);
});
