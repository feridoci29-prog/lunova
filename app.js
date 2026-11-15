// LUNOVA Application Controller
// Completely synchronized with all 9 visual design screens and real artwork assets

const STORAGE_KEYS = {
  PROJECTS: 'lunova_projects_v3',
  ACTIVE_PROJECT: 'lunova_active_project_id_v3',
  USER: 'lunova_user_profile_v3',
  SETTINGS: 'lunova_settings_v3'
};

const App = {
  projects: [],
  activeProjectId: null,
  activeFileName: 'index.html',
  editorUnsaved: false,
  user: {
    isLoggedIn: false,
    name: 'Alex',
    email: 'user@lunova.com',
    plan: 'Free Plan'
  },
  settings: {
    reducedMotion: false,
    editorFontSize: '13.5px',
    annualPricing: true
  },
  currentCategoryFilter: 'All',

  init() {
    this.loadState();
    this.initCanvasAtmosphere();
    this.setupEventListeners();
    Router.init();
    this.renderAllViews();
  },

  loadState() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) this.user = Object.assign(this.user, JSON.parse(storedUser));

      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProjects) {
        this.projects = JSON.parse(storedProjects);
      } else {
        this.projects = this.getDefaultProjectsPool();
        this.saveProjects();
      }

      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
      if (activeId && this.projects.some(p => p.id === activeId)) {
        this.activeProjectId = activeId;
      } else if (this.projects.length > 0) {
        this.activeProjectId = this.projects[0].id;
      }
    } catch (e) {
      console.warn('Fallback to memory pool:', e);
      this.projects = this.getDefaultProjectsPool();
      this.activeProjectId = this.projects[0].id;
    }
  },

  // 10 Full Initial Projects matching Image 5 with Real Photo Artwork
  getDefaultProjectsPool() {
    const portfolioTpl = LUNOVA_TEMPLATES[0];
    const saasTpl = LUNOVA_TEMPLATES[1];
    const shopTpl = LUNOVA_TEMPLATES[2];

    return [
      {
        id: 'proj-1',
        title: 'Portfolio Website',
        category: 'Website',
        thumbnail: 'assets/thumbs/proj-1-portfolio.jpg',
        updatedText: 'Edited 2 hours ago',
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        isShared: true,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [
          {
            role: 'assistant',
            time: '10:20',
            text: 'Hi Alex! 👋 I\'m LUNOVA, your AI creation assistant. Tell me what you want to build — a website, app, game, code, document or anything else. I\'ll bring your ideas to life.',
            suggestions: [
              'Create a modern portfolio website',
              'Build a mobile app',
              'Make a 2D game',
              'Generate a document',
              'Write code for a feature',
              'Design a landing page'
            ]
          },
          {
            role: 'user',
            time: '10:24',
            text: 'Create a modern portfolio website with a dark theme for a developer. Include animations, sections, and a contact form.'
          },
          {
            role: 'assistant',
            time: '10:24',
            text: 'Great! I\'ll create a modern, responsive portfolio website with a dark theme, smooth animations and a contact form for you. Here\'s the result:',
            projectCard: {
              title: 'Portfolio Website',
              type: 'Website • 12 files',
              status: 'Ready'
            }
          }
        ]
      },
      {
        id: 'proj-2',
        title: 'AI Chat App',
        category: 'Web App',
        thumbnail: 'assets/thumbs/proj-2-aichat.jpg',
        updatedText: 'Edited 1 day ago',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        isShared: true,
        files: JSON.parse(JSON.stringify(saasTpl.files)),
        chatHistory: [
          { role: 'assistant', time: 'Yesterday', text: 'AI Chat App initialized with real-time prompt loop.' }
        ]
      },
      {
        id: 'proj-3',
        title: 'E-Commerce Site',
        category: 'Website',
        thumbnail: 'assets/thumbs/proj-3-ecommerce.jpg',
        updatedText: 'Edited 3 days ago',
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        isShared: true,
        files: JSON.parse(JSON.stringify(shopTpl.files)),
        chatHistory: [
          { role: 'assistant', time: '3 days ago', text: 'E-Commerce Store created with responsive cart.' }
        ]
      },
      {
        id: 'proj-4',
        title: 'Fitness Tracker',
        category: 'Mobile App',
        thumbnail: 'assets/thumbs/proj-4-fitness.jpg',
        updatedText: 'Edited 5 days ago',
        updatedAt: new Date(Date.now() - 432000000).toISOString(),
        isShared: true,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '5 days ago', text: 'Fitness Tracker app ready.' }]
      },
      {
        id: 'proj-5',
        title: 'Game Environment',
        category: 'Game',
        thumbnail: 'assets/thumbs/proj-5-game.jpg',
        updatedText: 'Edited 1 week ago',
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
        isShared: false,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '1 week ago', text: 'Game canvas framework generated.' }]
      },
      {
        id: 'proj-6',
        title: 'Research Document',
        category: 'Document',
        thumbnail: 'assets/thumbs/proj-6-research.jpg',
        updatedText: 'Edited 1 week ago',
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
        isShared: false,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '1 week ago', text: 'Document formatting template ready.' }]
      },
      {
        id: 'proj-7',
        title: 'Travel Website',
        category: 'Website',
        thumbnail: 'assets/thumbs/proj-7-travel.jpg',
        updatedText: 'Edited 1 week ago',
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
        isShared: true,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '1 week ago', text: 'Travel adventure layout ready.' }]
      },
      {
        id: 'proj-8',
        title: 'Python Tool',
        category: 'Other',
        thumbnail: 'assets/thumbs/proj-8-python.jpg',
        updatedText: 'Edited 2 weeks ago',
        updatedAt: new Date(Date.now() - 1209600000).toISOString(),
        isShared: false,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '2 weeks ago', text: 'Python backend script scaffolded.' }]
      },
      {
        id: 'proj-9',
        title: 'Restaurant Website',
        category: 'Website',
        thumbnail: 'assets/thumbs/proj-9-restaurant.jpg',
        updatedText: 'Edited 3 weeks ago',
        updatedAt: new Date(Date.now() - 1814400000).toISOString(),
        isShared: false,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '3 weeks ago', text: 'Bistro reservations loaded.' }]
      },
      {
        id: 'proj-10',
        title: 'Weather App',
        category: 'Mobile App',
        thumbnail: 'assets/thumbs/proj-10-weather.jpg',
        updatedText: 'Edited 3 weeks ago',
        updatedAt: new Date(Date.now() - 1814400000).toISOString(),
        isShared: false,
        files: JSON.parse(JSON.stringify(portfolioTpl.files)),
        chatHistory: [{ role: 'assistant', time: '3 weeks ago', text: 'Weather telemetry radar ready.' }]
      }
    ];
  },

  saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      if (this.activeProjectId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, this.activeProjectId);
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  saveUserSettings() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {}
  },

  getActiveProject() {
    return this.projects.find(p => p.id === this.activeProjectId) || this.projects[0];
  },

  // Starry Cosmos Canvas
  initCanvasAtmosphere() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      dy: Math.random() * 0.04 + 0.01
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        if (!App.settings.reducedMotion) {
          s.y -= s.dy;
          if (s.y < 0) s.y = height;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${s.a})`;
        ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  },

  setupEventListeners() {
    const chatInput = document.getElementById('chatInputArea');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendChatMessage();
        }
      });
    }

    const dashInput = document.getElementById('dashPromptInput');
    if (dashInput) {
      dashInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitDashboardPrompt();
        }
      });
    }

    // Global Keyboard Shortcuts (Ctrl+S / Cmd+S to Save & Hot-Reload)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const wsView = document.getElementById('view-workspace');
        if (wsView && wsView.style.display !== 'none') {
          e.preventDefault();
          this.saveCodeChanges();
        }
      }
    });

    // Capture console messages & errors from sandboxed iframe preview
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'LUNOVA_CONSOLE') {
        this.addConsoleLog(event.data.level || 'log', event.data.message || '');
      }
    });
  },

  renderAllViews() {
    this.renderDashboard();
    this.renderWorkspace();
    this.renderProjectsGrid();
    this.renderTemplatesGrid();
  },

  handleLogin(e) {
    e.preventDefault();
    this.user.isLoggedIn = true;
    this.saveUserSettings();
    this.showToast('Welcome back, Alex!', 'success');
    Router.navigate('dashboard');
  },

  handleOAuthMock(provider) {
    this.user.isLoggedIn = true;
    this.saveUserSettings();
    this.showToast(`Signed in with ${provider} (Demo)`, 'success');
    Router.navigate('dashboard');
  },

  continueAsGuest() {
    this.user.isLoggedIn = true;
    this.saveUserSettings();
    Router.navigate('dashboard');
  },

  fillHeroPrompt(text) {
    const input = document.getElementById('landingHeroPromptInput');
    if (input) {
      input.value = text;
      input.focus();
    }
  },

  launchFromHeroPrompt() {
    const input = document.getElementById('landingHeroPromptInput');
    const prompt = input ? input.value.trim() : '';
    if (!prompt) {
      this.showToast('Please type an idea to build!', 'info');
      if (input) input.focus();
      return;
    }

    this.user.isLoggedIn = true;
    this.saveUserSettings();

    const synth = LunovaGenerator.synthesizeProject(prompt);
    const newProj = {
      id: 'proj-' + Date.now(),
      title: synth.title,
      category: synth.category,
      accent: synth.accent,
      accentName: synth.accentName,
      files: synth.files,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chatHistory: [
        {
          role: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Welcome! I've synthesized "${synth.title}" based on your prompt: "${prompt}". You can inspect code, tweak styles, or ask for adjustments.`,
          thoughtProcess: [
            `Analyzed vision: "${prompt}"`,
            `Generated ${synth.files.length} production-ready files`,
            `Configured ${synth.accentName} theme palette`,
            'Mounted live sandbox preview'
          ],
          fileChanges: synth.files.map(f => ({ name: f.name, linesAdded: Math.floor(Math.random() * 30) + 12 })),
          projectCard: {
            title: synth.title,
            type: `${synth.category} • ${synth.files.length} files`,
            status: 'Live & Ready'
          }
        }
      ]
    };

    this.projects.unshift(newProj);
    this.activeProjectId = newProj.id;
    this.saveProjects();

    Router.navigate('workspace');
    this.renderWorkspace();
    this.showToast(`"${synth.title}" built and opened in Studio! ✦`, 'success');
  },

  togglePasswordVisibility(id) {
    const el = document.getElementById(id);
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
  },

  showForgotPasswordModal() {
    alert('Demo Environment: All authentication is simulated locally. Sign in with any email or click "Get Started" to explore!');
  },

  launchFromCategory(category) {
    this.user.isLoggedIn = true;
    this.fillPrompt(`Create a modern ${category.toLowerCase()} project with interactive components.`);
    Router.navigate('dashboard');
  },

  // Dashboard (Image 3) - Uses Real Cropped Project Images
  renderDashboard() {
    const recentGrid = document.getElementById('dashRecentProjects');
    if (!recentGrid) return;

    const recent = this.projects.slice(0, 6);
    recentGrid.innerHTML = recent.map(p => `
      <div class="project-thumb-card" onclick="App.openProjectInWorkspace('${p.id}')">
        <div class="project-thumb-preview">
          <img src="${p.thumbnail || 'assets/thumbs/proj-1-portfolio.jpg'}" alt="${this.escapeHtml(p.title)}">
        </div>
        <div class="project-thumb-info">
          <div class="project-thumb-title">
            <span>${this.escapeHtml(p.title)}</span>
            <span style="color:var(--text-muted); font-size:16px;">⋮</span>
          </div>
          <div class="project-thumb-meta">
            <span class="template-badge">${p.category}</span>
            <span>${p.updatedText || 'Recently'}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  fillPrompt(text) {
    const input = document.getElementById('dashPromptInput');
    if (input) {
      input.value = text;
      input.focus();
    }
  },

  submitDashboardPrompt() {
    const input = document.getElementById('dashPromptInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    this.showToast('Synthesizing project with LUNOVA AI...', 'info');

    const synthesized = LunovaGenerator.synthesizeProject(text);
    const newProj = {
      id: 'proj-' + Date.now(),
      title: synthesized.title,
      category: synthesized.analysis.category.toUpperCase(),
      thumbnail: 'assets/thumbs/proj-1-portfolio.jpg',
      updatedText: 'Edited just now',
      updatedAt: new Date().toISOString(),
      isShared: false,
      files: synthesized.files,
      chatHistory: [
        {
          role: 'user',
          time: 'Just now',
          text: text
        },
        {
          role: 'assistant',
          time: 'Just now',
          text: `Synthesized **${synthesized.title}** from your prompt. Built responsive HTML5 markup, modern dark glassmorphic styling, and interactive modules.`,
          projectCard: {
            title: synthesized.title,
            type: `${synthesized.analysis.category.toUpperCase()} • ${synthesized.files.length} files`,
            status: 'Ready'
          }
        }
      ]
    };

    this.projects.unshift(newProj);
    this.activeProjectId = newProj.id;
    this.saveProjects();

    Router.navigate('workspace');
    this.renderWorkspace();
    this.showToast(`"${newProj.title}" is ready!`, 'success');
  },

  // =========================================================
  // AI WORKSPACE & LOVABLE / REPLIT STUDIO ENGINE
  // =========================================================
  currentWorkspaceTab: 'preview',
  consoleLogsCount: 0,
  autoSaveTimer: null,

  renderWorkspace() {
    const project = this.getActiveProject();
    if (!project) return;

    // Update Header Info
    const titleEl = document.getElementById('wsProjectTitleDisplay');
    if (titleEl) titleEl.textContent = project.title || 'Untitled Project';

    const slugEl = document.getElementById('previewUrlSlug');
    if (slugEl) {
      slugEl.textContent = (project.title || 'project').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 18);
    }

    this.renderChatMessages();
    this.renderSidebarFileTree();
    this.renderCodeEditorTabs();
    this.loadActiveFileIntoEditor();
    this.reloadPreview();
    this.switchWorkspaceTab(this.currentWorkspaceTab || 'preview');
  },

  renderChatMessages() {
    const container = document.getElementById('chatMessagesStream');
    if (!container) return;
    const project = this.getActiveProject();
    if (!project || !project.chatHistory) return;

    container.innerHTML = project.chatHistory.map(msg => {
      const isUser = msg.role === 'user';
      return `
        <div style="display:flex; gap:12px; margin-bottom:18px; align-self:${isUser ? 'flex-end' : 'flex-start'}; max-width:92%;">
          ${!isUser ? '<div class="ws-ai-avatar">🌙</div>' : ''}
          <div style="flex-grow:1;">
            <div style="background:${isUser ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(14, 22, 46, 0.95)'}; border:1px solid ${isUser ? '#3b82f6' : 'var(--border-glass)'}; padding:14px 18px; border-radius:14px; font-size:13.5px; color:#fff; line-height:1.55; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
              ${msg.thoughtProcess ? `
                <div class="ai-thought-box">
                  <div class="ai-thought-toggle" onclick="this.parentElement.classList.toggle('open')">
                    <span>💭 Thought Process (${msg.thoughtProcess.length} steps)</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="ai-thought-content">
                    <ul>
                      ${msg.thoughtProcess.map(step => `<li>${this.escapeHtml(step)}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              ` : ''}

              <div>${this.escapeHtml(msg.text)}</div>

              ${msg.fileChanges && msg.fileChanges.length > 0 ? `
                <div class="ai-changes-bar">
                  ${msg.fileChanges.map(fc => `
                    <span class="change-tag" onclick="App.switchActiveFile('${fc.name}'); App.switchWorkspaceTab('code');" title="Click to view file in editor">
                      📄 ${fc.name} <small>+${fc.linesAdded || 12}</small>
                    </span>
                  `).join('')}
                </div>
              ` : ''}

              ${msg.suggestions ? `
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:14px;">
                  ${msg.suggestions.map(s => `
                    <button class="prompt-chip" onclick="App.sendSuggestedPrompt('${s}')">${s}</button>
                  `).join('')}
                </div>
              ` : ''}

              ${msg.projectCard ? `
                <div class="chat-project-attachment-card">
                  <div class="att-card-top">
                    <span class="att-card-title">${this.escapeHtml(msg.projectCard.title)}</span>
                    <span style="color:#10b981; font-size:11px; font-weight:700;">● ${msg.projectCard.status}</span>
                  </div>
                  <div class="att-card-meta">${msg.projectCard.type}</div>
                  <div class="att-card-btn-row">
                    <button class="btn btn-primary btn-sm" onclick="App.switchWorkspaceTab('preview')">📺 Preview</button>
                    <button class="btn btn-glass btn-sm" onclick="App.switchWorkspaceTab('split')">Split View</button>
                    <button class="btn btn-glass btn-sm" onclick="App.switchWorkspaceTab('code')">&lt;/&gt; Code</button>
                  </div>
                </div>
              ` : ''}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px; text-align:${isUser ? 'right' : 'left'};">
              ${msg.time || ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  },

  sendSuggestedPrompt(text) {
    const input = document.getElementById('chatInputArea');
    if (input) {
      input.value = text;
      this.autoGrowTextarea(input);
    }
    this.sendChatMessage();
  },

  insertPromptChip(text) {
    const input = document.getElementById('chatInputArea');
    if (input) {
      input.value = text;
      this.autoGrowTextarea(input);
      input.focus();
    }
  },

  autoGrowTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  },

  enhancePrompt() {
    const input = document.getElementById('chatInputArea');
    if (!input || !input.value.trim()) {
      this.showToast('Please type a short idea first to enhance it!', 'info');
      return;
    }
    const raw = input.value.trim();
    input.value = `Design a high-converting, modern, fully responsive web application for "${raw}". Include polished glassmorphism panels, dark theme styling with glowing neon accents, accessible semantic HTML5, smooth CSS transitions, interactive JavaScript handlers with responsive mobile drawer navigation, and clean structured layout.`;
    this.autoGrowTextarea(input);
    this.showToast('Prompt enhanced with professional AI architecture specs! ✨', 'success');
  },

  clearActiveProjectChat() {
    const project = this.getActiveProject();
    if (!project) return;
    if (confirm('Clear chat history for this project?')) {
      project.chatHistory = [{
        role: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Workspace initialized for "${project.title}". How can I help you customize your project today?`
      }];
      this.saveProjects();
      this.renderChatMessages();
      this.showToast('Chat history cleared.', 'info');
    }
  },

  sendChatMessage() {
    const input = document.getElementById('chatInputArea');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const project = this.getActiveProject();
    if (!project) return;

    // Push User message
    project.chatHistory.push({
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });
    input.value = '';
    input.style.height = 'auto';
    this.renderChatMessages();

    // Show temporary thinking state
    const container = document.getElementById('chatMessagesStream');
    const thinkingNode = document.createElement('div');
    thinkingNode.id = 'tempThinkingBubble';
    thinkingNode.style.display = 'flex';
    thinkingNode.style.gap = '12px';
    thinkingNode.style.marginBottom = '18px';
    thinkingNode.innerHTML = `
      <div class="ws-ai-avatar">🌙</div>
      <div style="background:rgba(14, 22, 46, 0.9); border:1px solid rgba(56, 189, 248, 0.3); padding:12px 18px; border-radius:14px; font-size:13px; color:#38bdf8; display:flex; align-items:center; gap:8px;">
        <span class="status-pulse-dot" style="background:#38bdf8; box-shadow:0 0 8px #38bdf8;"></span>
        <span>Synthesizing code & updating live sandbox...</span>
      </div>
    `;
    if (container) {
      container.appendChild(thinkingNode);
      container.scrollTop = container.scrollHeight;
    }

    setTimeout(() => {
      const tempBubble = document.getElementById('tempThinkingBubble');
      if (tempBubble) tempBubble.remove();

      const modification = LunovaGenerator.modifyProject(project.files, text);
      project.files = modification.updatedFiles;
      project.updatedAt = new Date().toISOString();

      const changedNames = project.files.map(f => ({ name: f.name, linesAdded: Math.floor(Math.random() * 25) + 8 }));

      project.chatHistory.push({
        role: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I've updated your project according to your request: "${text}". All changes have been hot-reloaded into the live preview.`,
        thoughtProcess: [
          `Analyzed user prompt: "${text.slice(0, 45)}..."`,
          'Inspected DOM hierarchy and CSS variables',
          'Applied responsive styling and interactive JavaScript handlers',
          'Updated live sandboxed iframe environment'
        ],
        fileChanges: changedNames.slice(0, 3),
        projectCard: {
          title: project.title,
          type: `${project.category} • ${project.files.length} files`,
          status: 'Ready & Live'
        }
      });

      this.saveProjects();
      this.renderChatMessages();
      this.renderSidebarFileTree();
      this.renderCodeEditorTabs();
      this.loadActiveFileIntoEditor();
      this.reloadPreview();
      this.addConsoleLog('info', `[Hot Reload] Updated ${project.files.length} project files from prompt.`);
      this.showToast('Project updated & hot-reloaded!', 'success');
    }, 600);
  },

  openProjectInWorkspace(id) {
    this.activeProjectId = id;
    this.activeFileName = 'index.html';
    this.saveProjects();
    Router.navigate('workspace');
    this.renderWorkspace();
  },

  switchWorkspaceTab(tab) {
    this.currentWorkspaceTab = tab;
    const btnPreview = document.getElementById('tab-btn-preview');
    const btnSplit = document.getElementById('tab-btn-split');
    const btnCode = document.getElementById('tab-btn-code');

    if (btnPreview) btnPreview.classList.toggle('active', tab === 'preview');
    if (btnSplit) btnSplit.classList.toggle('active', tab === 'split');
    if (btnCode) btnCode.classList.toggle('active', tab === 'code');

    const container = document.getElementById('wsProjectPaneContainer');
    const codePane = document.getElementById('tabContentCode');
    const previewPane = document.getElementById('tabContentPreview');

    if (!container || !codePane || !previewPane) return;

    if (tab === 'split') {
      container.classList.add('ws-split-active');
      codePane.style.display = 'flex';
      previewPane.style.display = 'flex';
      this.loadActiveFileIntoEditor();
      this.reloadPreview();
    } else if (tab === 'code') {
      container.classList.remove('ws-split-active');
      codePane.style.display = 'flex';
      previewPane.style.display = 'none';
      this.loadActiveFileIntoEditor();
    } else {
      // preview
      container.classList.remove('ws-split-active');
      codePane.style.display = 'none';
      previewPane.style.display = 'flex';
      this.reloadPreview();
    }
  },

  setPreviewViewport(mode) {
    const vpDesktop = document.getElementById('vp-desktop');
    const vpTablet = document.getElementById('vp-tablet');
    const vpMobile = document.getElementById('vp-mobile');

    if (vpDesktop) vpDesktop.classList.toggle('active', mode === 'desktop');
    if (vpTablet) vpTablet.classList.toggle('active', mode === 'tablet');
    if (vpMobile) vpMobile.classList.toggle('active', mode === 'mobile');

    const iframe = document.getElementById('workspacePreviewIframe');
    if (!iframe) return;

    if (mode === 'desktop') {
      iframe.style.width = '100%';
      iframe.style.maxWidth = '100%';
    } else if (mode === 'tablet') {
      iframe.style.width = '768px';
      iframe.style.maxWidth = '768px';
    } else if (mode === 'mobile') {
      iframe.style.width = '375px';
      iframe.style.maxWidth = '375px';
    }
  },

  reloadPreview() {
    const iframe = document.getElementById('workspacePreviewIframe');
    if (!iframe) return;

    const project = this.getActiveProject();
    if (!project || !project.files) return;

    const htmlFile = project.files.find(f => f.name.endsWith('.html')) || project.files[0];
    const cssFiles = project.files.filter(f => f.name.endsWith('.css'));
    const jsFiles = project.files.filter(f => f.name.endsWith('.js'));

    let html = htmlFile ? htmlFile.content : '<h1>No HTML content</h1>';
    const combinedCss = cssFiles.map(c => `<style>${c.content}</style>`).join('\n');

    // Injected Console Interceptor to capture errors & logs in sandboxed iframe
    const consoleInterceptorScript = `
      <script>
        (function() {
          function sendLog(level, args) {
            try {
              var text = Array.prototype.slice.call(args).map(function(item) {
                if (typeof item === 'object') {
                  try { return JSON.stringify(item); } catch(e) { return String(item); }
                }
                return String(item);
              }).join(' ');
              window.parent.postMessage({ type: 'LUNOVA_CONSOLE', level: level, message: text }, '*');
            } catch(e) {}
          }
          var origLog = console.log;
          var origWarn = console.warn;
          var origError = console.error;
          var origInfo = console.info;

          console.log = function() { sendLog('log', arguments); if(origLog) origLog.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); if(origWarn) origWarn.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); if(origError) origError.apply(console, arguments); };
          console.info = function() { sendLog('info', arguments); if(origInfo) origInfo.apply(console, arguments); };

          window.onerror = function(msg, url, line, col, err) {
            sendLog('error', ['Runtime Error (line ' + (line||1) + '): ' + msg]);
            return false;
          };
        })();
      </script>
    `;

    const combinedJs = jsFiles.map(j => `<script>${j.content}</script>`).join('\n');

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${combinedCss}\n${consoleInterceptorScript}\n</head>`);
    } else {
      html = combinedCss + consoleInterceptorScript + html;
    }

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${combinedJs}</body>`);
    } else {
      html = html + combinedJs;
    }

    iframe.srcdoc = html;
  },

  openPreviewInNewWindow() {
    const project = this.getActiveProject();
    if (!project || !project.files) return;

    const htmlFile = project.files.find(f => f.name.endsWith('.html')) || project.files[0];
    const cssFiles = project.files.filter(f => f.name.endsWith('.css'));
    const jsFiles = project.files.filter(f => f.name.endsWith('.js'));

    let html = htmlFile ? htmlFile.content : '<h1>No HTML</h1>';
    const combinedCss = cssFiles.map(c => `<style>${c.content}</style>`).join('\n');
    const combinedJs = jsFiles.map(j => `<script>${j.content}</script>`).join('\n');

    if (html.includes('</head>')) html = html.replace('</head>', `${combinedCss}</head>`);
    else html = combinedCss + html;

    if (html.includes('</body>')) html = html.replace('</body>', `${combinedJs}</body>`);
    else html = html + combinedJs;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    this.showToast('Preview opened in new window! ↗', 'info');
  },

  // Interactive DevTools Console Drawer
  toggleConsoleDrawer() {
    const drawer = document.getElementById('wsConsoleDrawer');
    if (!drawer) return;
    drawer.classList.toggle('open');
  },

  clearConsoleLogs() {
    const stream = document.getElementById('wsConsoleLogsStream');
    if (stream) stream.innerHTML = '<div class="ws-console-line info">[Console cleared]</div>';
    this.consoleLogsCount = 0;
    this.updateConsoleBadge();
  },

  addConsoleLog(level, message) {
    const stream = document.getElementById('wsConsoleLogsStream');
    if (!stream) return;

    const line = document.createElement('div');
    line.className = `ws-console-line ${level}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.innerHTML = `<span style="color:#64748b; margin-right:6px;">[${timestamp}]</span> ${this.escapeHtml(message)}`;
    stream.appendChild(line);
    stream.scrollTop = stream.scrollHeight;

    this.consoleLogsCount = (this.consoleLogsCount || 0) + 1;
    this.updateConsoleBadge();
  },

  updateConsoleBadge() {
    const badge = document.getElementById('consoleBadge');
    const countBadge = document.getElementById('consoleCountBadge');
    if (badge) badge.textContent = `${this.consoleLogsCount} items`;
    if (countBadge) countBadge.textContent = this.consoleLogsCount;
  },

  // Code Studio Sidebar File Explorer
  renderSidebarFileTree() {
    const tree = document.getElementById('wsSidebarFileTree');
    if (!tree) return;
    const project = this.getActiveProject();
    if (!project) return;

    tree.innerHTML = project.files.map(f => {
      let icon = '📄';
      if (f.name.endsWith('.html')) icon = '🌐';
      else if (f.name.endsWith('.css')) icon = '🎨';
      else if (f.name.endsWith('.js')) icon = '⚡';
      else if (f.name.endsWith('.json')) icon = '📦';

      const isActive = f.name === this.activeFileName;
      return `
        <div class="ws-file-item ${isActive ? 'active' : ''}" onclick="App.switchActiveFile('${f.name}')">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>${icon}</span>
            <span>${f.name}</span>
          </div>
          ${project.files.length > 1 && !f.name.endsWith('index.html') ? `
            <button class="ws-icon-btn" style="font-size:11px;" onclick="event.stopPropagation(); App.deleteWorkspaceFile('${f.name}')" title="Delete file">✕</button>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  deleteWorkspaceFile(name) {
    const project = this.getActiveProject();
    if (!project || project.files.length <= 1) return;
    if (confirm(`Delete "${name}"?`)) {
      project.files = project.files.filter(f => f.name !== name);
      if (this.activeFileName === name) {
        this.activeFileName = project.files[0].name;
      }
      this.saveProjects();
      this.renderSidebarFileTree();
      this.renderCodeEditorTabs();
      this.loadActiveFileIntoEditor();
      this.reloadPreview();
      this.showToast(`Deleted ${name}`, 'info');
    }
  },

  // Code Editor Tabs
  renderCodeEditorTabs() {
    const container = document.getElementById('editorFileTabsList');
    if (!container) return;
    const project = this.getActiveProject();
    if (!project) return;

    container.innerHTML = project.files.map(f => `
      <button class="btn btn-glass btn-sm ${f.name === this.activeFileName ? 'active' : ''}" onclick="App.switchActiveFile('${f.name}')">
        ${f.name}
      </button>
    `).join('');
  },

  switchActiveFile(name) {
    this.activeFileName = name;
    this.renderSidebarFileTree();
    this.renderCodeEditorTabs();
    this.loadActiveFileIntoEditor();
  },

  loadActiveFileIntoEditor() {
    const project = this.getActiveProject();
    if (!project) return;
    const file = project.files.find(f => f.name === this.activeFileName) || project.files[0];
    if (file) {
      this.activeFileName = file.name;
      const editor = document.getElementById('activeCodeEditor');
      if (editor) {
        editor.value = file.content;
        this.updateLineNumbers();
        this.updateEditorStatus();
      }
      const saveText = document.getElementById('editorSaveText');
      if (saveText) saveText.textContent = 'Saved';
    }
  },

  updateLineNumbers() {
    const editor = document.getElementById('activeCodeEditor');
    const gutter = document.getElementById('editorLineNumbers');
    if (!editor || !gutter) return;

    const lineCount = editor.value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lineCount; i++) {
      numbers += i + '\n';
    }
    gutter.textContent = numbers;
  },

  syncEditorScroll() {
    const editor = document.getElementById('activeCodeEditor');
    const gutter = document.getElementById('editorLineNumbers');
    if (editor && gutter) {
      gutter.scrollTop = editor.scrollTop;
    }
  },

  handleEditorInput() {
    this.updateLineNumbers();
    this.updateEditorStatus();
    const saveText = document.getElementById('editorSaveText');
    if (saveText) saveText.textContent = 'Unsaved changes';

    // Auto-save debounce (1 sec)
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveCodeChanges(true);
    }, 1200);
  },

  updateEditorStatus() {
    const editor = document.getElementById('activeCodeEditor');
    const statsEl = document.getElementById('editorStatsText');
    const langBadge = document.getElementById('editorLanguageBadge');
    if (!editor) return;

    const lines = editor.value.split('\n').length;
    const chars = editor.value.length;
    if (statsEl) statsEl.textContent = `Lines: ${lines} • Chars: ${chars}`;

    if (langBadge && this.activeFileName) {
      if (this.activeFileName.endsWith('.html')) langBadge.textContent = 'HTML';
      else if (this.activeFileName.endsWith('.css')) langBadge.textContent = 'CSS';
      else if (this.activeFileName.endsWith('.js')) langBadge.textContent = 'JavaScript';
      else if (this.activeFileName.endsWith('.json')) langBadge.textContent = 'JSON';
      else langBadge.textContent = 'Text';
    }
  },

  saveCodeChanges(silent = false) {
    const project = this.getActiveProject();
    if (!project) return;
    const file = project.files.find(f => f.name === this.activeFileName);
    const editor = document.getElementById('activeCodeEditor');
    if (file && editor) {
      file.content = editor.value;
      this.saveProjects();
      this.reloadPreview();
      const saveText = document.getElementById('editorSaveText');
      if (saveText) saveText.textContent = 'Saved';
      if (!silent) this.showToast(`Saved changes to "${file.name}"`, 'success');
    }
  },

  formatActiveCode() {
    const editor = document.getElementById('activeCodeEditor');
    if (!editor) return;
    try {
      // Basic aesthetic line trimming
      const formatted = editor.value.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
      editor.value = formatted;
      this.saveCodeChanges();
      this.showToast('Code cleaned and formatted! ✨', 'success');
    } catch(e) {
      this.showToast('Could not format code', 'info');
    }
  },

  downloadActiveFile() {
    const project = this.getActiveProject();
    if (!project) return;
    const file = project.files.find(f => f.name === this.activeFileName);
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Deployment Simulation (Cloudflare Edge / Workers)
  triggerDeployModal() {
    const modal = document.getElementById('deployProjectModal');
    if (!modal) return;

    document.getElementById('deployStep1').className = 'deploy-step';
    document.getElementById('deployStep2').className = 'deploy-step';
    document.getElementById('deployStep3').className = 'deploy-step';
    document.getElementById('deployResultBox').style.display = 'none';
    document.getElementById('btnStartDeployAction').style.display = 'inline-block';

    modal.classList.add('open');
  },

  executeDeployment() {
    const s1 = document.getElementById('deployStep1');
    const s2 = document.getElementById('deployStep2');
    const s3 = document.getElementById('deployStep3');
    const resultBox = document.getElementById('deployResultBox');
    const btn = document.getElementById('btnStartDeployAction');

    btn.style.display = 'none';
    s1.className = 'deploy-step active';

    setTimeout(() => {
      s1.className = 'deploy-step done';
      s2.className = 'deploy-step active';

      setTimeout(() => {
        s2.className = 'deploy-step done';
        s3.className = 'deploy-step active';

        setTimeout(() => {
          s3.className = 'deploy-step done';
          resultBox.style.display = 'block';

          const project = this.getActiveProject();
          const slug = (project ? project.title : 'app').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 16);
          const liveUrl = `https://${slug}.lunova.pages.dev`;
          const link = document.getElementById('deployLiveUrlLink');
          if (link) {
            link.href = liveUrl;
            link.textContent = liveUrl;
          }
          this.showToast('Deployment finished! App is live.', 'success');
        }, 800);
      }, 800);
    }, 700);
  },

  copyDeployUrl() {
    const link = document.getElementById('deployLiveUrlLink');
    if (link) {
      navigator.clipboard.writeText(link.textContent).then(() => {
        this.showToast('URL copied to clipboard! 📋', 'success');
      });
    }
  },

  // Rename Project
  renameActiveProjectPrompt() {
    const project = this.getActiveProject();
    if (!project) return;
    const input = document.getElementById('renameProjectInput');
    if (input) input.value = project.title;
    const modal = document.getElementById('renameProjectModal');
    if (modal) modal.classList.add('open');
  },

  saveProjectRename() {
    const project = this.getActiveProject();
    const input = document.getElementById('renameProjectInput');
    if (!project || !input) return;

    const newTitle = input.value.trim();
    if (!newTitle) return;

    project.title = newTitle;
    this.saveProjects();
    this.closeModals();

    const titleEl = document.getElementById('wsProjectTitleDisplay');
    if (titleEl) titleEl.textContent = newTitle;
    this.renderProjectsGrid();
    this.showToast(`Renamed project to "${newTitle}"`, 'success');
  },

  renderFilesTable() {
    const tbody = document.getElementById('filesTableBody');
    if (!tbody) return;
    const project = this.getActiveProject();
    if (!project) return;

    tbody.innerHTML = project.files.map(f => `
      <tr>
        <td style="color:#fff; font-family:var(--font-mono);">${f.name}</td>
        <td><span class="template-badge">${f.name.split('.').pop().toUpperCase()}</span></td>
        <td style="color:var(--text-muted);">${(f.content.length / 1024).toFixed(1)} KB</td>
        <td>
          <button class="btn btn-glass btn-sm" onclick="App.switchActiveFile('${f.name}'); App.switchWorkspaceTab('code');">Edit</button>
        </td>
      </tr>
    `).join('');
  },

  promptNewFile() {
    document.getElementById('newFileNameInput').value = '';
    document.getElementById('newFileModal').classList.add('open');
  },

  confirmCreateFile() {
    const name = document.getElementById('newFileNameInput').value.trim();
    if (!name) return;
    const project = this.getActiveProject();
    if (!project) return;

    project.files.push({ name, content: '/* New File */\n' });
    this.saveProjects();
    this.closeModals();
    this.switchActiveFile(name);
    this.switchWorkspaceTab('code');
  },

  downloadProjectZip() {
    const project = this.getActiveProject();
    if (!project) return;

    const zip = new SimpleZip();
    for (const f of project.files) {
      zip.addFile(f.name, f.content);
    }
    const buffer = zip.build();
    const blob = new Blob([buffer], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast(`Downloaded ${a.download}!`, 'success');
  },

  // My Projects (Image 5) - Uses Real Cropped Thumbnails
  renderProjectsGrid() {
    const container = document.getElementById('allProjectsRichGrid');
    if (!container) return;

    const filtered = this.currentCategoryFilter === 'All'
      ? this.projects
      : this.projects.filter(p => p.category.toLowerCase().includes(this.currentCategoryFilter.toLowerCase()));

    container.innerHTML = filtered.map(p => `
      <div class="card-project-rich">
        <div class="card-rich-preview">
          <img src="${p.thumbnail || 'assets/thumbs/proj-1-portfolio.jpg'}" alt="${this.escapeHtml(p.title)}">
        </div>
        <div class="card-rich-body">
          <div class="card-rich-title">${this.escapeHtml(p.title)}</div>
          <span class="card-rich-tag">● ${p.category}</span>
          <div class="card-rich-time">${p.updatedText || 'Recently'}</div>
          <div class="card-rich-actions">
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="App.openProjectInWorkspace('${p.id}')">Open Project →</button>
            <button class="btn btn-glass btn-sm" onclick="App.openProjectInWorkspace('${p.id}')">⋮</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  filterProjectsByCat(cat) {
    this.currentCategoryFilter = cat;
    document.querySelectorAll('#projectsFilterGroup button').forEach(b => {
      b.classList.toggle('active', b.textContent === cat);
    });
    this.renderProjectsGrid();
  },

  promptNewProject() {
    document.getElementById('newProjectModalTitle').value = '';
    document.getElementById('newProjectModalPrompt').value = '';
    document.getElementById('newProjectModal').classList.add('open');
  },

  handleCreateProjectModal(e) {
    e.preventDefault();
    const prompt = document.getElementById('newProjectModalPrompt').value.trim();
    this.closeModals();
    this.fillPrompt(prompt);
    this.submitDashboardPrompt();
  },

  // Templates (Image 6) - Uses 12 Real Thumbnails
  renderTemplatesGrid(categoryFilter = 'All') {
    const container = document.getElementById('allTemplatesTwelveGrid');
    if (!container || typeof LUNOVA_TEMPLATES === 'undefined') return;

    const filtered = categoryFilter === 'All'
      ? LUNOVA_TEMPLATES
      : LUNOVA_TEMPLATES.filter(t => t.category.toLowerCase().includes(categoryFilter.toLowerCase()));

    container.innerHTML = filtered.map(t => `
      <div class="card-template-rich">
        <div class="card-template-preview">
          <img src="${t.thumbnail || 'assets/thumbs/tpl-1-portfolio.jpg'}" alt="${this.escapeHtml(t.title)}">
        </div>
        <div class="card-template-body">
          <div class="card-template-title">${this.escapeHtml(t.title)}</div>
          <div class="card-template-tag">● ${t.category}</div>
          <div class="card-template-actions">
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="App.useTemplate('${t.id}')">Use Template →</button>
            <button class="btn btn-glass btn-sm" onclick="this.textContent = this.textContent === '♡' ? '❤️' : '♡'">♡</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  filterTemplates(cat) {
    document.querySelectorAll('#templatesFilterGroup button').forEach(b => {
      b.classList.toggle('active', b.textContent === cat);
    });
    this.renderTemplatesGrid(cat);
  },

  useTemplate(id) {
    const tpl = LUNOVA_TEMPLATES.find(t => t.id === id);
    if (!tpl) return;

    const newProj = {
      id: 'proj-' + Date.now(),
      title: tpl.title,
      category: tpl.category,
      thumbnail: tpl.thumbnail,
      updatedText: 'Edited just now',
      updatedAt: new Date().toISOString(),
      isShared: false,
      files: JSON.parse(JSON.stringify(tpl.files)),
      chatHistory: [
        {
          role: 'assistant',
          time: 'Just now',
          text: `Loaded blueprint **${tpl.title}**. You can now edit, customize with AI, or export it.`,
          projectCard: {
            title: tpl.title,
            type: `${tpl.category} • Ready`,
            status: 'Ready'
          }
        }
      ]
    };

    this.projects.unshift(newProj);
    this.activeProjectId = newProj.id;
    this.saveProjects();

    Router.navigate('workspace');
    this.renderWorkspace();
    this.showToast(`Blueprint "${tpl.title}" deployed!`, 'success');
  },

  // Pricing (Image 7)
  togglePricingPeriod(isAnnual) {
    this.settings.annualPricing = isAnnual;
    const proEl = document.getElementById('priceProVal');
    const teamEl = document.getElementById('priceTeamVal');
    const proBilled = document.getElementById('priceProBilled');
    const teamBilled = document.getElementById('priceTeamBilled');

    if (proEl) proEl.textContent = isAnnual ? '$19' : '$24';
    if (teamEl) teamEl.textContent = isAnnual ? '$49' : '$69';
    if (proBilled) proBilled.textContent = isAnnual ? 'Billed yearly $228' : 'Billed monthly';
    if (teamBilled) teamBilled.textContent = isAnnual ? 'Billed yearly $588' : 'Billed monthly';
  },

  selectPlanNotice(plan) {
    alert(`Demo Mode: You selected the "${plan}" tier. All premium features are unlocked in this offline build.`);
  },

  // Settings (Image 8)
  saveProfileSettings() {
    this.user.name = document.getElementById('settingsUserName').value.trim();
    this.user.email = document.getElementById('settingsUserEmail').value.trim();
    this.saveUserSettings();
    document.getElementById('sidebarUserName').textContent = this.user.name;
    document.getElementById('sidebarUserEmail').textContent = this.user.email;
    this.showToast('Profile settings saved!', 'success');
  },

  confirmClearAllData() {
    if (confirm('CRITICAL: Delete your account and all local workspace projects?')) {
      localStorage.clear();
      this.projects = this.getDefaultProjectsPool();
      this.activeProjectId = this.projects[0].id;
      this.saveProjects();
      Router.navigate('landing');
      this.showToast('Account data reset.', 'info');
    }
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  },

  showToast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${type === 'success' ? '✓' : '✦'}</span> <span>${this.escapeHtml(msg)}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 3000);
  },

  escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

// Router
const Router = {
  currentRoute: 'landing',

  init() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  },

  handleHashChange() {
    const hash = window.location.hash.replace('#', '').trim() || 'landing';
    this.navigate(hash, false);
  },

  navigate(route, updateHash = true) {
    const valid = ['landing', 'login', 'signup', 'dashboard', 'workspace', 'projects', 'templates', 'pricing', 'settings', 'shared', 'features', 'faq'];
    if (!valid.includes(route)) route = 'landing';
    if (route === 'features' || route === 'faq') route = 'landing';

    this.currentRoute = route;
    if (updateHash) window.location.hash = route;

    const isPublic = ['landing', 'login', 'signup'].includes(route);
    const pubNav = document.getElementById('publicNavbar');
    const appShell = document.getElementById('app-shell');

    document.querySelectorAll('.view-screen').forEach(s => s.style.display = 'none');

    if (isPublic) {
      if (pubNav) pubNav.style.display = 'flex';
      if (appShell) appShell.style.display = 'none';
      const el = document.getElementById(`view-${route}`);
      if (el) el.style.display = route === 'login' ? 'flex' : 'block';
    } else {
      if (pubNav) pubNav.style.display = 'none';
      if (appShell) appShell.style.display = 'flex';
      const el = document.getElementById(`view-${route}`);
      if (el) el.style.display = route === 'workspace' ? 'grid' : route === 'dashboard' ? 'grid' : 'block';

      document.querySelectorAll('.sidebar-item-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`side-${route}`);
      if (activeBtn) activeBtn.classList.add('active');

      if (route === 'workspace') App.renderWorkspace();
      else if (route === 'projects') App.renderProjectsGrid();
      else if (route === 'templates') App.renderTemplatesGrid();
      else if (route === 'dashboard') App.renderDashboard();
    }

    window.scrollTo(0, 0);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
