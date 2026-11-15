// LUNOVA Production Blueprints with Real Photo Thumbnails

const LUNOVA_TEMPLATES = [
  {
    id: "tpl-portfolio",
    title: "Modern Portfolio",
    category: "Website",
    headline: "Turn Ideas Into Reality.",
    description: "Futuristic dark portfolio with interactive 3D cards, project filter, and contact form.",
    badge: "Popular",
    thumbnail: "assets/thumbs/tpl-1-portfolio.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Alex — Portfolio</title><link rel="stylesheet" href="style.css"></head><body><h1>Turn Ideas Into Reality.</h1><p>Full stack creative technologist building spatial interfaces and AI agents.</p></body></html>`
      },
      { name: "style.css", content: `body { background:#030712; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center; }` },
      { name: "script.js", content: `console.log("Portfolio ready");` }
    ]
  },
  {
    id: "tpl-saas",
    title: "AI SaaS Landing",
    category: "Landing Page",
    headline: "The Next Generation AI Platform.",
    description: "High-conversion SaaS product showcase with live interactive telemetry and tier selector.",
    badge: "Trending",
    thumbnail: "assets/thumbs/tpl-2-saas.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#030510; color:#fff; font-family:sans-serif; text-align:center; padding:60px 20px;"><h1>The Next Generation AI Platform.</h1><p style="color:#888;">Empower your organization with autonomous agent swarms.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("SaaS Blueprint ready.");` }
    ]
  },
  {
    id: "tpl-ecommerce",
    title: "E-Commerce Store",
    category: "E-Commerce",
    headline: "Step Into The Future.",
    description: "Premium sneakers and footwear boutique with cart management and quick view drawer.",
    badge: "Featured",
    thumbnail: "assets/thumbs/tpl-3-ecommerce.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#0a0c14; color:#fff; font-family:sans-serif; text-align:center; padding:60px 20px;"><h1>Step Into The Future.</h1><p style="color:#888;">Gravitational cushioning engineered for urban terrain.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Store loaded");` }
    ]
  },
  {
    id: "tpl-blog",
    title: "Blog & Magazine",
    category: "Blog",
    headline: "Stories That Inspire.",
    description: "Editorial layout with featured reading picks, newsletter subscription, and audio playback teaser.",
    badge: "Editorial",
    thumbnail: "assets/thumbs/tpl-4-blog.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#080a12; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Stories That Inspire.</h1><p style="color:#888;">Curated essays on design, artificial intelligence, and deep tech culture.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Blog loaded");` }
    ]
  },
  {
    id: "tpl-mobile-app",
    title: "Mobile App Landing",
    category: "Landing Page",
    headline: "Reimagine Your Everyday.",
    description: "Sleek iOS & Android showcase with dual phone mockups and one-tap testflight beta link.",
    badge: "Mobile",
    thumbnail: "assets/thumbs/tpl-5-mobile.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#060814; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Reimagine Your Everyday.</h1><p style="color:#888;">The personal companion that simplifies your routines with zero friction.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("App landing ready");` }
    ]
  },
  {
    id: "tpl-business",
    title: "Business Website",
    category: "Business",
    headline: "Build Without Limits.",
    description: "Corporate enterprise architecture with client logos, service breakdown, and quote calculator.",
    badge: "Enterprise",
    thumbnail: "assets/thumbs/tpl-6-business.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#070b18; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Build Without Limits.</h1><p style="color:#888;">Global strategic consulting and digital transformation infrastructure.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Business site loaded");` }
    ]
  },
  {
    id: "tpl-dashboard",
    title: "AI Tool Dashboard",
    category: "Web App",
    headline: "Deep Observability & Telemetry.",
    description: "Real-time query metrics, distributed cluster map, and automated log anomaly detection.",
    badge: "Web App",
    thumbnail: "assets/thumbs/tpl-7-dashboard.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#080b16; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>AI Tool Dashboard</h1><p style="color:#888;">Observability, distributed traces, and model inference statistics.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Dashboard ready");` }
    ]
  },
  {
    id: "tpl-restaurant",
    title: "Restaurant Website",
    category: "Website",
    headline: "Taste Perfection.",
    description: "Michelin-inspired dining destination with tasting menus, table reservations, and wine pairings.",
    badge: "Dining",
    thumbnail: "assets/thumbs/tpl-8-restaurant.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#0a0907; color:#f5efe6; font-family:serif; padding:60px 20px; text-align:center;"><h1 style="color:#e0a96d;">Taste Perfection.</h1><p style="color:#a89f91;">Slow wood-fired dining and natural biodynamic wines.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Restaurant ready");` }
    ]
  },
  {
    id: "tpl-travel",
    title: "Travel & Adventure",
    category: "Website",
    headline: "Explore The World.",
    description: "Bespoke Nordic & alpine expeditions with flight itineraries and weather briefings.",
    badge: "Travel",
    thumbnail: "assets/thumbs/tpl-9-travel.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#050912; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Explore The World.</h1><p style="color:#888;">Curated backcountry adventures and secluded expedition lodges.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Travel ready");` }
    ]
  },
  {
    id: "tpl-fitness",
    title: "Fitness & Health",
    category: "Website",
    headline: "Stronger Every Day.",
    description: "High-intensity performance training club with class bookings and nutrition trackers.",
    badge: "Fitness",
    thumbnail: "assets/thumbs/tpl-10-fitness.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#090a10; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Stronger Every Day.</h1><p style="color:#888;">Precision biometric training and metabolic conditioning.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Fitness ready");` }
    ]
  },
  {
    id: "tpl-agency",
    title: "Creative Agency",
    category: "Website",
    headline: "Ideas That Move The World.",
    description: "Boutique visual studio creating brand identities, spatial interactions, and type design.",
    badge: "Agency",
    thumbnail: "assets/thumbs/tpl-11-agency.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#070710; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Ideas That Move The World.</h1><p style="color:#888;">Identity design, spatial environments, and generative branding.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Agency ready");` }
    ]
  },
  {
    id: "tpl-realestate",
    title: "Real Estate",
    category: "Website",
    headline: "Find Your Perfect Place.",
    description: "Architectural luxury villas and contemporary penthouses with interactive floorplans.",
    badge: "Real Estate",
    thumbnail: "assets/thumbs/tpl-12-realestate.jpg",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html><html><body style="background:#070a14; color:#fff; font-family:sans-serif; padding:60px 20px; text-align:center;"><h1>Find Your Perfect Place.</h1><p style="color:#888;">Curated architectural estates and panoramic residences.</p></body></html>`
      },
      { name: "style.css", content: `body { margin:0; }` },
      { name: "script.js", content: `console.log("Real estate ready");` }
    ]
  }
];

if (typeof module !== 'undefined') {
  module.exports = LUNOVA_TEMPLATES;
}
