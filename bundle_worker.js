const fs = require('fs');
const path = require('path');

const dir = __dirname;
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const genJs = fs.readFileSync(path.join(dir, 'generator.js'), 'utf8');
const tplJs = fs.readFileSync(path.join(dir, 'templates.js'), 'utf8');
const zipJs = fs.readFileSync(path.join(dir, 'zip.js'), 'utf8');

html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);
html = html.replace('<script src="zip.js"></script>', `<script>${zipJs}</script>`);
html = html.replace('<script src="templates.js"></script>', `<script>${tplJs}</script>`);
html = html.replace('<script src="generator.js"></script>', `<script>${genJs}</script>`);
html = html.replace('<script src="app.js"></script>', `<script>${appJs}</script>`);

const workerCode = `export default {
  async fetch(request, env, ctx) {
    const html = ${JSON.stringify(html)};
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8'
      }
    });
  }
};
`;

fs.writeFileSync(path.join(dir, 'worker.js'), workerCode, 'utf8');
console.log('worker.js generated successfully! Size: ' + (workerCode.length / 1024).toFixed(1) + ' KB');
