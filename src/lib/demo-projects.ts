export type DemoProjectId = "frame" | "olive" | "pulse";
export type DemoProject = {
  id: DemoProjectId;
  name: string;
  category: string;
  description: string;
  prompt: string;
  kind: "website" | "app";
  accent: string;
  html: string;
};

const document = (title: string, css: string, body: string, script = "") =>
  `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>*{box-sizing:border-box}body{margin:0}button,a,input{font:inherit}button,a{touch-action:manipulation}button{cursor:pointer}a{color:inherit}button:focus-visible,a:focus-visible{outline:3px solid #6499e9;outline-offset:4px}${css}</style></head><body>${body}${script ? `<script>${script}</script>` : ""}</body></html>`;

const frame = document(
  "FRAME — Photography portfolio",
  `
body{background:#171918;color:#f3f2ed;font-family:Arial,sans-serif}header{height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 6%;border-bottom:1px solid #ffffff17}.wordmark{font:28px Georgia,serif;letter-spacing:-1px}nav{display:flex;gap:23px;font-size:11px}nav a{text-decoration:none;opacity:.7}.frame-hero{position:relative;min-height:470px;display:grid;grid-template-columns:1fr 1fr;padding:60px 6% 40px;gap:24px}.frame-copy{position:relative;z-index:1;align-self:center}h1{font:clamp(68px,12vw,150px)/.85 Georgia,serif;letter-spacing:-.055em;margin:0 0 24px}small{font-size:10px;letter-spacing:.35em}.line{height:1px;background:#f3f2ed;width:46px;margin:26px 0}.frame-copy p{max-width:220px;color:#aeb2ac;font:12px/1.8 Arial,sans-serif}.frame-image{height:405px;min-width:0;overflow:hidden}.frame-image img{height:100%;width:100%;object-fit:cover;filter:grayscale(1);object-position:center}.frame-bottom{padding:0 6% 32px;display:flex;justify-content:space-between;font-size:10px;color:#aeb2ac}.work{padding:32px 6%;border-top:1px solid #ffffff17;display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.work article{height:100px;background:linear-gradient(130deg,#4c514d,#222623);display:flex;align-items:end;padding:16px;font-size:11px}.work article:nth-child(2){background:linear-gradient(30deg,#999c95,#343a36)}.work article:nth-child(3){background:linear-gradient(145deg,#232825,#646b62)}.contact{padding:30px 6%;border-top:1px solid #ffffff17;display:flex;justify-content:space-between;align-items:center}.contact h2{font:32px Georgia,serif;margin:0}.contact a{font-size:12px}@media(max-width:540px){header{height:58px}.frame-hero{padding:40px 6% 24px;grid-template-columns:1fr;gap:24px}.frame-image{height:230px;grid-row:2}h1{font-size:84px}.frame-copy p{max-width:280px}.work{grid-template-columns:1fr}.work article{height:70px}.contact h2{font-size:26px}nav{gap:12px}}
`,
  `<header><div class="wordmark">FRAME</div><nav aria-label="Portfolio"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav></header><main><section class="frame-hero" id="about"><div class="frame-copy"><h1>FRAME</h1><small>PHOTOGRAPHY<br>PORTFOLIO</small><div class="line"></div><p>Finding the extraordinary<br>in the spaces between.</p></div><div class="frame-image"><img src="/demo/frame-architecture.jpg" alt="Sculptural modern architecture reaching into the sky"></div></section><div class="frame-bottom"><span>Independent photographer & visual storyteller</span><span>EST. 2020</span></div><section class="work" id="work" aria-label="Selected work"><article>01 — Structures</article><article>02 — Quiet moments</article><article>03 — New perspectives</article></section><section class="contact" id="contact"><h2>See things differently.</h2><a href="mailto:hello@example.com">Let's talk ↗</a></section></main>`,
);

const olive = document(
  "Olive & Stone — Interior design",
  `
body{background:#f3f0e6;color:#3e4a2b;font-family:Arial,sans-serif}header{height:68px;padding:0 6%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #4351381a}.wordmark{font:24px Georgia,serif;letter-spacing:-.7px}nav{display:flex;gap:22px;font-size:11px}nav a{text-decoration:none}main{padding:42px 6%}.olive-hero{display:grid;grid-template-columns:.95fr 1.05fr;gap:35px;align-items:center}.eyebrow{font-size:9px;letter-spacing:.23em;margin:0 0 22px}h1{font:clamp(40px,5vw,64px)/1.05 Georgia,serif;letter-spacing:-.045em;margin:0 0 24px}.intro{font:12px/1.9 Arial,sans-serif;color:#72765f;max-width:270px}.olive-image{height:400px}.olive-image img{width:100%;height:100%;object-fit:cover}.button{display:inline-block;padding:13px 20px;background:#435333;color:#f4f1e7;font-size:11px;border-radius:3px;text-decoration:none;margin-top:20px}.olive-footer{display:flex;justify-content:space-between;gap:20px;margin-top:38px;padding-top:24px;border-top:1px solid #43513830;font-size:11px;color:#72765f}.services{padding-top:52px}.services h2{font:32px Georgia,serif}.service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.service-grid article{border-top:1px solid #43513840;padding-top:20px}.service-grid h3{font:22px Georgia,serif}.service-grid p{font-size:12px;line-height:1.8;color:#72765f}.contact{margin-top:50px;padding:32px;background:#e5e6d7}.contact h2{font:30px Georgia,serif;margin-top:0}.contact a{font-size:12px}@media(max-width:540px){header{height:58px}.wordmark{font-size:20px}nav{gap:12px;font-size:10px}main{padding-top:30px}.olive-hero{grid-template-columns:1fr;gap:28px}.olive-image{height:270px}h1{font-size:48px}.intro{max-width:100%}.olive-footer{flex-wrap:wrap}.service-grid{grid-template-columns:1fr}}
`,
  `<header><div class="wordmark">Olive &amp; Stone</div><nav aria-label="Interior studio"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#contact">Contact</a></nav></header><main><section class="olive-hero" id="projects"><div><p class="eyebrow">CONSIDERED SPACES. QUIETER LIVING.</p><h1>Interior design<br>for modern<br>living.</h1><p class="intro">Thoughtful spaces that feel timeless, comfortable, and uniquely yours.</p><a class="button" href="#services">Our services ↗</a></div><div class="olive-image"><img src="/demo/olive-interior.jpg" alt="A warm living room with natural materials and thoughtful interior details"></div></section><div class="olive-footer"><span>Residential & boutique spaces</span><span>Natural materials. Lasting character.</span></div><section class="services" id="services"><h2>Room to feel at home.</h2><div class="service-grid"><article><h3>Full interiors</h3><p>From the first floor plan to the finishing touches.</p></article><article><h3>A fresh perspective</h3><p>A considered update for the spaces you already love.</p></article><article><h3>The little details</h3><p>Materials, colour and objects, brought together beautifully.</p></article></div></section><section class="contact" id="contact"><h2>Let's make room for you.</h2><a href="mailto:studio@example.com">Start a conversation ↗</a></section></main>`,
);

const pulse = document(
  "Pulse — Analytics dashboard demo",
  `
body{background:#111620;color:#eaf0fa;font-family:Arial,sans-serif;display:grid;grid-template-columns:160px 1fr;min-height:650px}aside{border-right:1px solid #ffffff0b;padding:26px 16px;background:#10151e}.brand{font-size:23px;letter-spacing:-1px;font-weight:700;margin:0 12px 38px}.brand span{color:#80aefe}nav{display:grid;gap:8px}nav button{border:0;background:transparent;color:#8795ab;font-size:11px;text-align:left;border-radius:6px;padding:12px}nav button.active{background:#253754;color:#e1ebff}nav button:hover{background:#1e2a3e}.aside-bottom{font-size:10px;color:#62728a;margin:120px 12px 0}main{padding:28px 30px;min-width:0}.pulse-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}h1{font-size:22px;letter-spacing:-.7px;margin:0}.period{font-size:10px;background:#1a2230;border:1px solid #2b3548;border-radius:5px;padding:8px;color:#c0cce0}.greeting{font-size:11px;color:#718299;margin-top:7px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.stat{background:#1a2230;border:1px solid #ffffff07;border-radius:8px;padding:18px 15px}.stat small{font-size:10px;color:#8796ac}.stat strong{display:block;font-size:25px;margin:9px 0}.stat span{font-size:9px;color:#65dfba}.chart{background:#171f2c;border:1px solid #ffffff08;border-radius:9px;margin-top:18px;padding:20px}.chart-top{display:flex;justify-content:space-between;font-size:11px}.chart-top span{font-size:9px;color:#70829d}.chart svg{width:100%;height:190px;display:block;margin-top:12px}.chart-axis{display:flex;justify-content:space-between;font-size:8px;color:#6c7d94}.recent{padding:23px 0}.recent h2{font-size:12px;font-weight:500}.row{display:grid;grid-template-columns:1.5fr 1fr auto;padding:13px 0;border-bottom:1px solid #ffffff0b;font-size:10px;color:#9eacc1}.row strong{color:#dfe9fa;font-weight:400}.badge{font-size:9px;color:#67dcb2;background:#1d3731;padding:3px 6px;border-radius:4px}.notice{font-size:9px;color:#718299;margin-top:28px}.hidden{display:none}@media(max-width:540px){body{grid-template-columns:1fr}aside{display:none}main{padding:24px 18px}.stats{gap:8px}.stat{padding:12px 10px}.stat strong{font-size:21px}.pulse-top{margin-bottom:20px}.chart{padding:16px}.row{grid-template-columns:1.3fr 1fr auto}}
`,
  `<aside><div class="brand"><span>▥</span> Pulse</div><nav aria-label="Analytics"><button class="active" data-view="Overview">▦ &nbsp; Overview</button><button data-view="Analytics">↗ &nbsp; Analytics</button><button data-view="Customers">♧ &nbsp; Customers</button><button data-view="Reports">▤ &nbsp; Reports</button></nav><div class="aside-bottom">Workspace<br><br>Demo organization</div></aside><main><div class="pulse-top"><div><h1 id="view-title">Overview</h1><p class="greeting">A clear picture of your business.</p></div><select class="period" aria-label="Date range"><option>Last 30 days</option><option>Last 7 days</option></select></div><section class="stats"><article class="stat"><small>Active users</small><strong id="active-users">12,480</strong><span>↗ 12.4% vs. previous period</span></article><article class="stat"><small>Revenue</small><strong id="revenue">$48,320</strong><span>↗ 8.2% vs. previous period</span></article><article class="stat"><small>Conversion</small><strong>3.9%</strong><span>↗ 0.6% vs. previous period</span></article></section><section class="chart"><div class="chart-top">User activity <span>Sample data</span></div><svg viewBox="0 0 600 190" role="img" aria-label="Sample user activity trending upwards"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#55d7d2" stop-opacity=".25"/><stop offset="1" stop-color="#55d7d2" stop-opacity="0"/></linearGradient></defs><g stroke="#ffffff09"><path d="M0 25h600M0 75h600M0 125h600M0 175h600"/></g><path d="M0 155C30 158 40 125 75 128S125 155 155 110S205 120 245 92S295 100 332 68S390 94 420 57S460 60 495 35S550 62 600 12V190H0Z" fill="url(#area)"/><path d="M0 155C30 158 40 125 75 128S125 155 155 110S205 120 245 92S295 100 332 68S390 94 420 57S460 60 495 35S550 62 600 12" fill="none" stroke="#6be3d2" stroke-width="2.5"/></svg><div class="chart-axis"><span>Mar 1</span><span>Mar 8</span><span>Mar 15</span><span>Mar 22</span><span>Mar 30</span></div></section><section class="recent"><h2>Recent activity</h2><div class="row"><strong>Product launch</strong><span>Website</span><span class="badge">Published</span></div><div class="row"><strong>Spring collection</strong><span>Campaign</span><span class="badge">Published</span></div><div class="row"><strong>Customer research</strong><span>Report</span><span class="badge">Ready</span></div></section><p class="notice">Interactive template · All figures are illustrative sample data.</p></main>`,
  `document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(item=>item.classList.remove('active'));button.classList.add('active');document.querySelector('#view-title').textContent=button.dataset.view;}));document.querySelector('select').addEventListener('change',event=>{const week=event.target.selectedIndex===1;document.querySelector('#active-users').textContent=week?'3,120':'12,480';document.querySelector('#revenue').textContent=week?'$12,080':'$48,320';});`,
);

export const demoProjects: DemoProject[] = [
  {
    id: "frame",
    name: "FRAME",
    category: "Portfolio",
    description: "A different point of view.",
    prompt:
      "A bold black-and-white photography portfolio called FRAME with an editorial layout, architectural photography, selected work and a contact section",
    kind: "website",
    accent: "#c4c8c0",
    html: frame,
  },
  {
    id: "olive",
    name: "Olive & Stone",
    category: "Business",
    description: "Thoughtfully made spaces.",
    prompt:
      "A sophisticated interior design studio website called Olive & Stone with warm limestone colors, olive green typography, services and a contact section",
    kind: "website",
    accent: "#b5c19c",
    html: olive,
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "App",
    description: "A clearer picture of your business.",
    prompt:
      "A dark analytics dashboard app called Pulse with an overview, sample activity chart, date range filtering and customer reports",
    kind: "app",
    accent: "#91b8ff",
    html: pulse,
  },
];

export const getDemoProject = (id: DemoProjectId) =>
  demoProjects.find((project) => project.id === id) ?? demoProjects[0]!;
