const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components'];

// We map old dark mode / generic hex values to our new Token variables
// Or we map them directly to our new semantic tailwind utility classes

const colorMappings = {
  // Replace old dark backgrounds
  'bg-[#0d131f]': 'bg-ibf-bg',
  'bg-[#070711]': 'bg-ibf-bg',
  'bg-[#111827]': 'bg-ibf-surface',
  'bg-[#1e1e3a]': 'bg-ibf-surface',
  'bg-[#1e2a3a]': 'bg-ibf-border',
  'bg-slate-900': 'bg-ibf-bg',
  'bg-black': 'bg-ibf-bg',
  'bg-[#0b101a]': 'bg-ibf-bg',
  'bg-[#121a2f]': 'bg-ibf-surface',
  'bg-[rgba(7,7,17,0.8)]': 'bg-white/80',
  'bg-[#162032]': 'bg-ibf-surface',
  'bg-[#1a2333]': 'bg-ibf-surface',
  'bg-[rgba(13,19,31,0.5)]': 'bg-ibf-bg/50',
  // Old borders
  'border-[#1e1e3a]': 'border-ibf-border',
  'border-[#1e2a3a]': 'border-ibf-border',
  'border-slate-800': 'border-ibf-border',
  'border-slate-700': 'border-ibf-border',
  'border-[#2a3649]': 'border-ibf-border',
  'border-[#2d3748]': 'border-ibf-border',
  'border-[#ffffff10]': 'border-ibf-border',
  'border-[#ffffff20]': 'border-ibf-border',
  // Text colors
  'text-white': 'text-ibf-heading', // mostly text-white was used for headings in dark mode
  'text-gray-400': 'text-ibf-muted',
  'text-gray-500': 'text-ibf-hint',
  'text-slate-400': 'text-ibf-muted',
  'text-slate-300': 'text-ibf-body',
  'text-[#9ca3af]': 'text-ibf-muted',
  'text-[#64748b]': 'text-ibf-muted',
  'text-[#cbd5e1]': 'text-ibf-body',
  'text-[#f8fafc]': 'text-ibf-heading',
  'text-blue-400': 'text-ibf-primary',
  'text-blue-500': 'text-ibf-primary',
  'text-[#3b82f6]': 'text-ibf-primary',
  'text-[#60a5fa]': 'text-ibf-primary',
  // Specific student/founder colors (assuming teal/violet mapping)
  'text-[#1D9E75]': 'text-ibf-secondary',
  'text-[#16805f]': 'text-[#0A7A70]',
  'border-blue-500': 'border-ibf-primary',
  'bg-blue-600': 'bg-ibf-primary',
  'hover:bg-blue-700': 'hover:bg-[#5B3FC8]',
  'bg-[#1e2d4a]': 'bg-ibf-primary-light',
  'hover:text-[#e0e8ff]': 'hover:text-ibf-primary',
  'text-[#4a5a7a]': 'text-ibf-muted',
  // Additional typical ones
  'text-[#BDB5A8]': 'text-ibf-hint',
  'text-[#9A8E7E]': 'text-ibf-muted',
  'text-[#5A4E3E]': 'text-ibf-body',
  'text-[#1A1208]': 'text-ibf-heading',
};

// Also apply typograhy mapping if obvious
// We'll replace hardcoded fonts
const replaceRegexes = [
  { pattern: /font-serif/g, replacement: "font-['Instrument_Serif',serif] italic" },
  { pattern: /font-sans/g, replacement: "font-['Bricolage_Grotesque',sans-serif]" },
  // Let's replace button class with btn-primary if it matches large tailwind strings
  // but it's safer to just let the standard tailwind utilities work using our new colors
];

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

const processFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  for (const [oldClass, newClass] of Object.entries(colorMappings)) {
    // using regex to ensure it's matched exactly in a class string, though string replace is faster
    // we use global replace
    content = content.split(oldClass).join(newClass);
  }

  for (const { pattern, replacement } of replaceRegexes) {
    content = content.replace(pattern, replacement);
  }

  // Also replace Hexes directly in styles or missed ones
  content = content.replace(/#FFFFFF/gi, 'white');
  content = content.replace(/#FAFAF7/gi, 'var(--ibf-bg)');
  content = content.replace(/#F4F1EA/gi, 'var(--ibf-surface)');
  content = content.replace(/#E8E5DE/gi, 'var(--ibf-border)');
  content = content.replace(/#1A1208/gi, 'var(--ibf-heading)');
  content = content.replace(/#5A4E3E/gi, 'var(--ibf-body)');
  content = content.replace(/#9A8E7E/gi, 'var(--ibf-muted)');
  content = content.replace(/#BDB5A8/gi, 'var(--ibf-hint)');
  content = content.replace(/#6B4FD8/gi, 'var(--ibf-primary)');
  content = content.replace(/#EDE8FF/gi, 'var(--ibf-primary-light)');
  content = content.replace(/#0D9488/gi, 'var(--ibf-secondary)');
  content = content.replace(/#E0F7F5/gi, 'var(--ibf-secondary-light)');
  content = content.replace(/#166534/gi, 'var(--ibf-success-text)');
  content = content.replace(/#DCFCE7/gi, 'var(--ibf-success-bg)');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Modified: ${file}`);
  }
};

DIRECTORIES.forEach(dir => {
  walk(path.join(__dirname, dir), (err, files) => {
    if (err) throw err;
    files.forEach(processFile);
  });
});
