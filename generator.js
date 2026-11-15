// LUNOVA Intelligent Code Synthesis Engine
// Generates complete, responsive, multi-file web applications from natural language prompts
// Supports iterative modifications, theme switching, and component injection

const LunovaGenerator = {
  // Analyze user intent & extract features
  analyzePrompt(prompt) {
    const p = prompt.toLowerCase();
    
    // Category detection
    let category = 'landing';
    if (p.includes('shop') || p.includes('store') || p.includes('e-commerce') || p.includes('buy') || p.includes('cart')) {
      category = 'shop';
    } else if (p.includes('portfolio') || p.includes('cv') || p.includes('personal') || p.includes('resume') || p.includes('özgeçmiş')) {
      category = 'portfolio';
    } else if (p.includes('app') || p.includes('dashboard') || p.includes('todo') || p.includes('tracker') || p.includes('tool')) {
      category = 'app';
    } else if (p.includes('cafe') || p.includes('café') || p.includes('restaurant') || p.includes('bistro') || p.includes('food') || p.includes('coffee') || p.includes('yemek')) {
      category = 'cafe';
    } else if (p.includes('event') || p.includes('conference') || p.includes('summit') || p.includes('festival')) {
      category = 'event';
    }

    // Color theme extraction
    let accent = '#38bdf8'; // Ice blue default
    let accentName = 'Ice Blue';
    if (p.includes('emerald') || p.includes('green') || p.includes('yeşil')) {
      accent = '#10b981';
      accentName = 'Emerald';
    } else if (p.includes('purple') || p.includes('violet') || p.includes('mor')) {
      accent = '#a855f7';
      accentName = 'Violet';
    } else if (p.includes('amber') || p.includes('gold') || p.includes('sarı') || p.includes('orange')) {
      accent = '#f59e0b';
      accentName = 'Amber';
    } else if (p.includes('rose') || p.includes('pink') || p.includes('pembe') || p.includes('red')) {
      accent = '#f43f5e';
      accentName = 'Rose';
    } else if (p.includes('cyan') || p.includes('neon')) {
      accent = '#06b6d4';
      accentName = 'Neon Cyan';
    }

    // Derive project title
    let title = prompt.trim();
    if (title.length > 36) {
      const words = title.split(' ').slice(0, 4).join(' ');
      title = words.charAt(0).toUpperCase() + words.slice(1);
    } else {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    title = title.replace(/[^\w\s-]/gi, '').trim() || 'Custom Project';

    return { category, accent, accentName, title, rawPrompt: prompt };
  },

  // Generate complete multi-file project from prompt
  synthesizeProject(prompt) {
    const analysis = this.analyzePrompt(prompt);
    const { category, accent, title, rawPrompt } = analysis;

    let files = [];

    if (category === 'shop') {
      files = this.buildShopTemplate(title, rawPrompt, accent);
    } else if (category === 'portfolio') {
      files = this.buildPortfolioTemplate(title, rawPrompt, accent);
    } else if (category === 'app') {
      files = this.buildAppTemplate(title, rawPrompt, accent);
    } else if (category === 'cafe') {
      files = this.buildDiningTemplate(title, rawPrompt, accent);
    } else {
      files = this.buildLandingTemplate(title, rawPrompt, accent);
    }

    return {
      title,
      analysis,
      files
    };
  },

  // Modify existing files based on conversational revision prompt
  modifyProject(files, revisionPrompt) {
    const p = revisionPrompt.toLowerCase();
    const updatedFiles = JSON.parse(JSON.stringify(files));
    const changelog = [];

    // Find style file
    const styleFile = updatedFiles.find(f => f.name.endsWith('.css'));
    const htmlFile = updatedFiles.find(f => f.name.endsWith('.html'));
    const jsFile = updatedFiles.find(f => f.name.endsWith('.js'));

    // Color accent update
    let newAccent = null;
    if (p.includes('emerald') || p.includes('green') || p.includes('yeşil')) newAccent = '#10b981';
    else if (p.includes('purple') || p.includes('violet') || p.includes('mor')) newAccent = '#a855f7';
    else if (p.includes('amber') || p.includes('gold') || p.includes('sarı')) newAccent = '#f59e0b';
    else if (p.includes('rose') || p.includes('pink') || p.includes('red') || p.includes('kırmızı')) newAccent = '#f43f5e';
    else if (p.includes('blue') || p.includes('ice') || p.includes('mavi')) newAccent = '#38bdf8';
    else if (p.includes('cyan')) newAccent = '#06b6d4';

    if (newAccent && styleFile) {
      styleFile.content = styleFile.content.replace(/--accent:\s*#[a-fA-F0-9]{3,8}/g, `--accent: ${newAccent}`);
      styleFile.content = styleFile.content.replace(/#38bdf8|#10b981|#a855f7|#f59e0b|#f43f5e/g, newAccent);
      changelog.push(`Updated theme accent color to ${newAccent} in \`${styleFile.name}\`.`);
    }

    // Modal or contact injection
    if ((p.includes('contact') || p.includes('modal') || p.includes('iletişim')) && htmlFile) {
      if (!htmlFile.content.includes('id="contactModal"')) {
        const modalHtml = `
  <!-- Injected Contact Modal -->
  <div id="contactModal" class="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:999; align-items:center; justify-content:center;">
    <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:32px; width:90%; max-width:440px; position:relative;">
      <button onclick="document.getElementById('contactModal').style.display='none'" style="position:absolute; top:16px; right:16px; background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
      <h3 style="margin-bottom:8px; font-size:20px; color:#fff;">Get in Touch</h3>
      <p style="color:#94a3b8; font-size:14px; margin-bottom:20px;">Send a message and our team will get back to you shortly.</p>
      <form onsubmit="event.preventDefault(); alert('Message sent!'); document.getElementById('contactModal').style.display='none';">
        <input type="text" placeholder="Your Name" required style="width:100%; padding:10px 14px; margin-bottom:12px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; outline:none;">
        <input type="email" placeholder="Your Email" required style="width:100%; padding:10px 14px; margin-bottom:12px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; outline:none;">
        <textarea placeholder="Your Message" rows="3" required style="width:100%; padding:10px 14px; margin-bottom:16px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; outline:none;"></textarea>
        <button type="submit" style="width:100%; padding:12px; background:var(--accent, #38bdf8); color:#000; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Send Message</button>
      </form>
    </div>
  </div>
`;
        htmlFile.content = htmlFile.content.replace('</body>', `${modalHtml}\n</body>`);
        // Add open button if not present
        if (!htmlFile.content.includes("document.getElementById('contactModal')")) {
          htmlFile.content = htmlFile.content.replace('</header>', `  <div style="text-align:center; margin-top:20px;"><button onclick="document.getElementById('contactModal').style.display='flex'" style="background:transparent; border:1px solid var(--accent, #38bdf8); color:var(--accent, #38bdf8); padding:8px 20px; border-radius:999px; cursor:pointer; font-weight:600;">Open Contact Modal 💬</button></div>\n</header>`);
        }
        changelog.push(`Injected interactive Contact Modal into \`${htmlFile.name}\`.`);
      }
    }

    // Darker / Lighter background
    if (p.includes('darker') || p.includes('black') || p.includes('karanlık')) {
      if (styleFile) {
        styleFile.content = styleFile.content.replace(/background:\s*#[a-fA-F0-9]{3,8}/g, 'background: #03050a');
        changelog.push(`Shifted primary background to deep void black in \`${styleFile.name}\`.`);
      }
    }

    // If no specific keyword matched, add a custom enhancement section
    if (changelog.length === 0) {
      if (htmlFile) {
        const enhancementHtml = `
  <!-- Enhancement Section based on: ${revisionPrompt.replace(/</g, '&lt;')} -->
  <section class="section custom-enhancement" style="padding:60px 8%; text-align:center; border-top:1px solid rgba(255,255,255,0.06);">
    <div style="display:inline-block; font-size:12px; color:var(--accent, #38bdf8); text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">✦ Custom Specification</div>
    <h2 style="font-size:28px; margin-bottom:12px;">Tailored Experience</h2>
    <p style="color:#94a3b8; max-width:640px; margin:0 auto 24px;">Configured according to prompt: "${revisionPrompt.replace(/</g, '&lt;')}".</p>
    <div style="display:inline-flex; gap:12px;">
      <button onclick="alert('Feature triggered!')" style="background:var(--accent, #38bdf8); color:#000; border:none; padding:10px 22px; border-radius:8px; font-weight:700; cursor:pointer;">Explore Feature</button>
    </div>
  </section>
`;
        htmlFile.content = htmlFile.content.replace('</main>', `${enhancementHtml}\n</main>`);
        if (!htmlFile.content.includes('custom-enhancement')) {
          htmlFile.content = htmlFile.content.replace('</body>', `${enhancementHtml}\n</body>`);
        }
        changelog.push(`Synthesized tailored section matching "${revisionPrompt}" in \`${htmlFile.name}\`.`);
      }
    }

    return {
      updatedFiles,
      changelog
    };
  },

  // Generator Templates

  buildLandingTemplate(title, prompt, accent) {
    return [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Intelligent Platform</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="nav">
    <div class="brand">✦ ${title}</div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#showcase">Showcase</a>
      <a href="#pricing">Pricing</a>
      <button class="btn-primary" onclick="triggerAction()">Get Started</button>
    </div>
  </nav>

  <header class="hero">
    <div class="hero-tag">✦ NEXT GENERATION PLATFORM</div>
    <h1>Transform your vision into high-impact digital reality.</h1>
    <p>${prompt}. Built with precision engineering, clean architectural foundations, and effortless responsiveness.</p>
    <div class="hero-actions">
      <button class="btn-primary" onclick="triggerAction()">Launch Application</button>
      <button class="btn-secondary" onclick="viewDocs()">Explore Documentation</button>
    </div>
  </header>

  <main>
    <section id="features" class="section">
      <div class="section-title">
        <span>Engineered for Performance</span>
        <h2>Core Capabilities</h2>
      </div>
      <div class="grid">
        <div class="card">
          <div class="card-icon">⚡</div>
          <h3>Sub-Millisecond Engine</h3>
          <p>Instantaneous execution with zero runtime latency, optimized for real-time customer workflows.</p>
        </div>
        <div class="card">
          <div class="card-icon">🛡️</div>
          <h3>Autonomous Security</h3>
          <p>Cryptographically validated sandbox isolating memory bounds and guarding against anomalies.</p>
        </div>
        <div class="card">
          <div class="card-icon">🌐</div>
          <h3>Elastic Scalability</h3>
          <p>Automatically scales across distributed edge nodes with global caching and load balancing.</p>
        </div>
      </div>
    </section>

    <section id="showcase" class="section banner-section">
      <div class="banner-box">
        <h2>Ready to build at the speed of thought?</h2>
        <p>Deploy in seconds and scale to millions with our battle-tested infrastructure.</p>
        <button class="btn-primary" onclick="triggerAction()">Start Free Now</button>
      </div>
    </section>
  </main>

  <footer>
    <p>© 2026 ${title}. All rights reserved. Designed with LUNOVA Studio.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`
      },
      {
        name: "style.css",
        content: `:root {
  --accent: ${accent};
  --bg-dark: #050811;
  --bg-card: rgba(15, 23, 42, 0.6);
  --border: rgba(255, 255, 255, 0.08);
  --text: #f8fafc;
  --text-muted: #94a3b8;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: var(--bg-dark);
  color: var(--text);
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 8%;
  background: rgba(5, 8, 17, 0.85);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border);
}

.brand {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text);
}

.nav-links { display: flex; align-items: center; gap: 24px; }
.nav-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.nav-links a:hover { color: var(--text); }

.btn-primary {
  background: var(--accent);
  color: #050811;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(56, 189, 248, 0.35);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
}

.hero {
  padding: 100px 8% 60px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.hero-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.hero h1 {
  font-size: clamp(36px, 6vw, 60px);
  font-weight: 800;
  letter-spacing: -1.5px;
  line-height: 1.15;
  margin-bottom: 20px;
}

.hero p {
  font-size: 18px;
  color: var(--text-muted);
  max-width: 680px;
  margin: 0 auto 36px;
}

.hero-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }

.section { padding: 80px 8%; max-width: 1200px; margin: 0 auto; }
.section-title { text-align: center; margin-bottom: 50px; }
.section-title span { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); }
.section-title h2 { font-size: 36px; font-weight: 700; margin-top: 8px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  transition: transform 0.2s, border-color 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.card h3 { font-size: 20px; margin-bottom: 10px; }
.card p { font-size: 14px; color: var(--text-muted); }

.banner-section { padding-top: 0; }
.banner-box {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
}

.banner-box h2 { font-size: 32px; margin-bottom: 12px; }
.banner-box p { color: var(--text-muted); margin-bottom: 24px; }

footer {
  text-align: center;
  padding: 40px 8%;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 14px;
}`
      },
      {
        name: "script.js",
        content: `function triggerAction() {
  alert("Welcome to ${title}! Your session has begun.");
}

function viewDocs() {
  alert("Documentation loaded. Explore the source files in the Code editor!");
}

console.log("${title} initialized successfully.");`
      }
    ];
  },

  buildShopTemplate(title, prompt, accent) {
    return [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Premium Store</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <header class="header">
    <div class="logo">🛍️ ${title}</div>
    <div class="cart-pill" onclick="viewCart()">Cart (<span id="cartCount">0</span>)</div>
  </header>

  <section class="hero">
    <h1>Curated Goods & Essentials</h1>
    <p>${prompt}</p>
  </section>

  <main class="store-grid">
    <div class="item-card">
      <div class="item-icon">✨</div>
      <h3>Signature Edition</h3>
      <div class="price">$149.00</div>
      <p>Precision handcrafted item built with recycled aeronautical materials.</p>
      <button class="btn-buy" onclick="addToCart('Signature Edition', 149)">Add to Cart</button>
    </div>
    <div class="item-card">
      <div class="item-icon">⚡</div>
      <h3>Pro Performance Kit</h3>
      <div class="price">$229.00</div>
      <p>Engineered for maximum daily durability, ergonomics, and seamless utility.</p>
      <button class="btn-buy" onclick="addToCart('Pro Performance Kit', 229)">Add to Cart</button>
    </div>
    <div class="item-card">
      <div class="item-icon">🌟</div>
      <h3>Artisan Collection</h3>
      <div class="price">$89.00</div>
      <p>Limited batch release with serialized authenticity certification.</p>
      <button class="btn-buy" onclick="addToCart('Artisan Collection', 89)">Add to Cart</button>
    </div>
  </main>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        name: "style.css",
        content: `:root { --accent: ${accent}; }
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#080b14; color:#f1f5f9; font-family:'Plus Jakarta Sans',sans-serif; padding-bottom:60px; }
.header { display:flex; justify-content:space-between; align-items:center; padding:20px 8%; border-bottom:1px solid #1a233a; }
.logo { font-size:20px; font-weight:700; color:#fff; }
.cart-pill { background:rgba(56,189,248,0.1); border:1px solid var(--accent); color:var(--accent); padding:8px 18px; border-radius:999px; cursor:pointer; font-size:14px; font-weight:600; }
.hero { text-align:center; padding:60px 20px 40px; max-width:700px; margin:0 auto; }
.hero h1 { font-size:40px; margin-bottom:12px; }
.hero p { color:#94a3b8; font-size:16px; }
.store-grid { max-width:1000px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; padding:0 20px; }
.item-card { background:#101524; border:1px solid #1e2842; border-radius:16px; padding:28px; display:flex; flex-direction:column; }
.item-icon { font-size:44px; margin-bottom:16px; }
.item-card h3 { font-size:20px; margin-bottom:6px; }
.price { color:var(--accent); font-weight:700; font-size:18px; margin-bottom:12px; }
.item-card p { color:#94a3b8; font-size:14px; margin-bottom:24px; flex-grow:1; }
.btn-buy { background:var(--accent); color:#000; border:none; padding:12px; border-radius:8px; font-weight:700; cursor:pointer; }`
      },
      {
        name: "script.js",
        content: `let cart = [];
function addToCart(name, price) {
  cart.push({ name, price });
  document.getElementById('cartCount').textContent = cart.length;
  alert(\`Added "\${name}" to bag! Total items: \${cart.length}\`);
}
function viewCart() {
  if (cart.length === 0) return alert('Your cart is empty.');
  const total = cart.reduce((s, i) => s + i.price, 0);
  alert(\`Cart (\${cart.length} items): Total $\${total}.00\`);
}`
      }
    ];
  },

  buildPortfolioTemplate(title, prompt, accent) {
    return [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Portfolio</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="avatar">👨‍💻</div>
      <h1>${title}</h1>
      <p class="role">Specialist & Creator</p>
      <p class="desc">${prompt}</p>
    </header>

    <section class="projects">
      <h2>Selected Highlights</h2>
      <div class="project-list">
        <div class="card">
          <h3>Architectural Platform</h3>
          <p>Full-stack modular infrastructure with autonomous telemetry and real-time processing.</p>
          <div class="tag">TypeScript • Node.js • Cloud</div>
        </div>
        <div class="card">
          <h3>Generative Interface</h3>
          <p>Adaptive design workspace bridging natural language prompt mechanics with live compilation.</p>
          <div class="tag">UI Architecture • WebGL</div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <button class="btn-contact" onclick="alert('Contact sent! Thanks for visiting.')">Get in Touch</button>
    </footer>
  </div>
</body>
</html>`
      },
      {
        name: "style.css",
        content: `:root { --accent: ${accent}; }
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#070a12; color:#f8fafc; font-family:'Plus Jakarta Sans',sans-serif; padding:60px 20px; }
.container { max-width:760px; margin:0 auto; }
.header { margin-bottom:48px; }
.avatar { font-size:48px; margin-bottom:16px; }
h1 { font-size:38px; margin-bottom:6px; }
.role { color:var(--accent); font-size:16px; font-weight:600; margin-bottom:14px; }
.desc { color:#94a3b8; font-size:16px; line-height:1.6; }
.projects h2 { font-size:22px; margin-bottom:20px; }
.project-list { display:flex; flex-direction:column; gap:16px; }
.card { background:#0f1422; border:1px solid #1c253b; border-radius:14px; padding:24px; }
.card h3 { font-size:18px; margin-bottom:8px; }
.card p { color:#94a3b8; font-size:14px; margin-bottom:14px; }
.tag { font-size:12px; color:var(--accent); font-family:monospace; }
.footer { margin-top:40px; text-align:center; }
.btn-contact { background:var(--accent); color:#000; border:none; padding:12px 28px; border-radius:999px; font-weight:700; cursor:pointer; }`
      },
      {
        name: "script.js",
        content: `console.log("Portfolio loaded.");`
      }
    ];
  },

  buildAppTemplate(title, prompt, accent) {
    return [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Interactive App</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app-shell">
    <div class="top-bar">
      <h2>✦ ${title}</h2>
      <div class="status-badge">Live Ready</div>
    </div>
    <div class="app-body">
      <p class="desc">${prompt}</p>
      <div class="stats-grid">
        <div class="stat-card">
          <span>Queries Executed</span>
          <strong id="counter">1,420</strong>
        </div>
        <div class="stat-card">
          <span>Active Connections</span>
          <strong>38</strong>
        </div>
      </div>
      <div class="action-box">
        <input type="text" id="userInput" placeholder="Enter input parameter...">
        <button onclick="runProcess()">Execute Operation</button>
      </div>
      <div class="console-box" id="consoleOutput">
        [system]: Application initialized and awaiting instructions.
      </div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        name: "style.css",
        content: `:root { --accent: ${accent}; }
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#080910; color:#f1f5f9; font-family:'Plus Jakarta Sans',sans-serif; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }
.app-shell { width:100%; max-width:600px; background:#10131d; border:1px solid #1d2334; border-radius:18px; overflow:hidden; }
.top-bar { display:flex; justify-content:space-between; align-items:center; padding:18px 24px; background:#141824; border-bottom:1px solid #1d2334; }
.status-badge { background:rgba(56,189,248,0.15); color:var(--accent); font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; }
.app-body { padding:24px; }
.desc { color:#94a3b8; font-size:14px; margin-bottom:20px; }
.stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
.stat-card { background:#161b29; padding:16px; border-radius:10px; }
.stat-card span { font-size:12px; color:#64748b; display:block; }
.stat-card strong { font-size:22px; color:#fff; }
.action-box { display:flex; gap:10px; margin-bottom:16px; }
.action-box input { flex-grow:1; background:#161b29; border:1px solid #232a3d; border-radius:8px; padding:10px 14px; color:#fff; font-size:14px; outline:none; }
.action-box button { background:var(--accent); color:#000; border:none; padding:10px 18px; border-radius:8px; font-weight:700; cursor:pointer; }
.console-box { background:#080a10; border:1px solid #181d2a; border-radius:8px; padding:12px; font-family:monospace; font-size:12px; color:#38bdf8; min-height:70px; }`
      },
      {
        name: "script.js",
        content: `let count = 1420;
function runProcess() {
  const input = document.getElementById('userInput');
  const val = input.value.trim() || 'default-job';
  count++;
  document.getElementById('counter').textContent = count.toLocaleString();
  const consoleEl = document.getElementById('consoleOutput');
  consoleEl.innerHTML += \`<br>[info]: Executed task for "\${val}" successfully.\`;
  input.value = '';
}`
      }
    ];
  },

  buildDiningTemplate(title, prompt, accent) {
    return [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Artisan Dining</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <header class="hero">
    <div class="tag">Artisan Kitchen</div>
    <h1>${title}</h1>
    <p>${prompt}</p>
    <button class="btn" onclick="alert('Table booked! We look forward to welcoming you.')">Reserve a Table</button>
  </header>
  <main class="menu">
    <div class="plate">
      <h4>Signature Chef Tasting</h4>
      <span class="price">$38.00</span>
      <p>Seasonal five-course heirloom ingredients locally harvested.</p>
    </div>
    <div class="plate">
      <h4>Cold Brew Extraction</h4>
      <span class="price">$7.50</span>
      <p>Slow roasted single origin Colombian beans steeped for 24 hours.</p>
    </div>
  </main>
</body>
</html>`
      },
      {
        name: "style.css",
        content: `:root { --accent: ${accent}; }
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#0e0f13; color:#f5efe6; font-family:'Plus Jakarta Sans',sans-serif; text-align:center; padding:60px 20px; }
.tag { color:var(--accent); text-transform:uppercase; font-size:12px; letter-spacing:2px; margin-bottom:12px; }
h1 { font-family:'Playfair Display',serif; font-size:46px; margin-bottom:16px; color:#fff; }
p { color:#a1a1aa; max-width:600px; margin:0 auto 30px; font-size:16px; }
.btn { background:var(--accent); color:#000; border:none; padding:12px 28px; border-radius:999px; font-weight:700; cursor:pointer; }
.menu { max-width:700px; margin:50px auto 0; display:grid; gap:20px; text-align:left; }
.plate { background:#16171d; border:1px solid #232530; border-radius:14px; padding:24px; }
.plate h4 { font-family:'Playfair Display',serif; font-size:20px; color:#fff; margin-bottom:4px; }
.price { color:var(--accent); font-weight:700; font-size:15px; }
.plate p { color:#888; font-size:14px; margin-top:8px; margin-bottom:0; }`
      },
      {
        name: "script.js",
        content: `console.log("Bistro menu initialized.");`
      }
    ];
  }
};

if (typeof module !== 'undefined') {
  module.exports = LunovaGenerator;
}
