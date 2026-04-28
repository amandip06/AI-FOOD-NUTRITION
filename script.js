/**
 * NutriScan AI — script.js
 * ─────────────────────────────────────────────────────────────────────────────
 * AI-powered food nutrition analysis app.
 *
 * Architecture:
 *  - NutriScanApp: Main controller (init, event binding, state)
 *  - AIAnalyzer: Simulated AI — structured to swap in real Vision APIs
 *  - NutritionRenderer: Renders all result UI components
 *  - DailyLog: Manages daily food tracking
 *  - ThemeManager: Dark/light mode
 *  - ToastManager: Notification system
 *
 * To connect a real AI Vision API (e.g., OpenAI, Gemini):
 *   Replace the AIAnalyzer.analyze() method's simulation block with
 *   a real API call. See comments in AIAnalyzer below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════════
   DATA LOADER
══════════════════════════════════════════════ */
const DataLoader = {
  _cache: null,

  /** Load food data from data.json */
  async load() {
    if (this._cache) return this._cache;
    try {
      const res = await fetch('./data.json');
      if (!res.ok) throw new Error('Failed to load data.json');
      this._cache = await res.json();
      return this._cache;
    } catch (err) {
      console.error('[NutriScan] DataLoader error:', err);
      Toast.show('Failed to load food database.', 'error');
      return null;
    }
  }
};


/* ══════════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════════ */
const Toast = {
  _el: null,
  _timeout: null,

  init() {
    this._el = document.getElementById('toast');
  },

  show(message, type = 'info', duration = 3000) {
    if (!this._el) return;
    clearTimeout(this._timeout);
    this._el.textContent = message;
    this._el.className = `toast ${type}`;
    // Force reflow for re-animation
    void this._el.offsetWidth;
    this._el.classList.add('show');
    this._timeout = setTimeout(() => this._el.classList.remove('show'), duration);
  }
};


/* ══════════════════════════════════════════════
   THEME MANAGER
══════════════════════════════════════════════ */
const ThemeManager = {
  _current: 'dark',

  init() {
    // Load saved preference
    const saved = localStorage.getItem('nutriscan_theme') || 'dark';
    this.set(saved, false);

    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggle();
    });
  },

  set(theme, save = true) {
    this._current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (save) localStorage.setItem('nutriscan_theme', theme);
  },

  toggle() {
    this.set(this._current === 'dark' ? 'light' : 'dark');
    Toast.show(`Switched to ${this._current} mode`, 'info', 1500);
  }
};


/* ══════════════════════════════════════════════
   AI ANALYZER
   ─────────────────────────────────────────────
   To swap in a REAL Vision API:
   1. Replace the `_simulateAnalysis()` call in analyze() with your API call.
   2. Parse the real response to extract food name.
   3. Match it against the database or return raw nutrition from the API.

   Example real API structure (OpenAI Vision):
   ─────────────────────────────────────────────
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
     body: JSON.stringify({
       model: 'gpt-4o',
       messages: [{
         role: 'user',
         content: [
           { type: 'image_url', image_url: { url: imageDataURL } },
           { type: 'text', text: 'Identify this food and return: { "food": "name" }' }
         ]
       }],
       max_tokens: 100
     })
   });
   const data = await response.json();
   const foodName = JSON.parse(data.choices[0].message.content).food;
   ─────────────────────────────────────────────
══════════════════════════════════════════════ */
const AIAnalyzer = {
  /** Analyzing messages shown during the fake "AI" loading sequence */
  _messages: [
    'Scanning image...',
    'Detecting food...',
    'Identifying nutritional profile...',
    'Calculating macronutrients...',
    'Cross-referencing database...',
    'Generating health analysis...'
  ],

  /**
   * Main analyze method.
   * @param {string} imageDataURL - Base64 encoded image data URL
   * @param {Array}  foodDatabase - Array of food objects from data.json
   * @returns {Object|null} - Matched food object or null
   */
  async analyze(imageDataURL, foodDatabase) {
    // ── SIMULATION MODE ──────────────────────────────────────
    // In production: replace this block with a real API call.
    // Pass imageDataURL to OpenAI Vision / Google Gemini Vision / etc.
    // Then match the returned food name against foodDatabase.
    // ─────────────────────────────────────────────────────────

    await this._simulateAnalysis();
    const result = this._pickRandomFood(foodDatabase);
    return result;
  },

  /**
   * Simulates AI analysis delay with animated messages.
   * Replace this with real API latency in production.
   */
  async _simulateAnalysis() {
    const msgEl = document.getElementById('analyzingMsg');
    const delay = ms => new Promise(r => setTimeout(r, ms));

    const totalDuration = 3500; // ms
    const perMessage = Math.floor(totalDuration / this._messages.length);

    for (const msg of this._messages) {
      if (msgEl) msgEl.textContent = msg;
      await delay(perMessage);
    }
  },

  /**
   * Picks a food randomly — simulating image recognition.
   * In production, match returned API food name against database.
   */
  _pickRandomFood(foodDatabase) {
    const idx = Math.floor(Math.random() * foodDatabase.length);
    return foodDatabase[idx];
  },

  /**
   * Match a food name (from real AI API response) against the database.
   * Use this in production when you have a real food name from the API.
   */
  matchFoodByName(name, foodDatabase) {
    if (!name) return null;
    const lowerName = name.toLowerCase().trim();
    return foodDatabase.find(food =>
      food.name.toLowerCase() === lowerName ||
      food.aliases.some(alias => lowerName.includes(alias))
    ) || null;
  }
};


/* ══════════════════════════════════════════════
   NUTRITION RENDERER
══════════════════════════════════════════════ */
const NutritionRenderer = {

  /** Nutrition detail row config */
  _rows: [
    { key: 'fiber',        label: 'Fiber',         unit: 'g',   icon: '🌾', dvKey: 'fiber',        color: '#84cc16' },
    { key: 'sugar',        label: 'Sugar',          unit: 'g',   icon: '🍬', dvKey: 'sugar',        color: '#f472b6' },
    { key: 'sodium',       label: 'Sodium',         unit: 'mg',  icon: '🧂', dvKey: 'sodium',       color: '#facc15' },
    { key: 'potassium',    label: 'Potassium',      unit: 'mg',  icon: '⚡', dvKey: 'potassium',    color: '#60a5fa' },
    { key: 'calcium',      label: 'Calcium',        unit: 'mg',  icon: '🦴', dvKey: 'calcium',      color: '#a78bfa' },
    { key: 'iron',         label: 'Iron',           unit: 'mg',  icon: '🔩', dvKey: 'iron',         color: '#fb923c' },
    { key: 'vitaminC',     label: 'Vitamin C',      unit: 'mg',  icon: '🍊', dvKey: 'vitaminC',     color: '#f97316' },
    { key: 'vitaminA',     label: 'Vitamin A',      unit: 'mcg', icon: '👁', dvKey: 'vitaminA',     color: '#fbbf24' },
    { key: 'cholesterol',  label: 'Cholesterol',    unit: 'mg',  icon: '💉', dvKey: 'cholesterol',  color: '#f87171' },
  ],

  /**
   * Render the complete results section.
   * @param {Object} food - Food data object from database
   * @param {number} portions - Serving multiplier
   * @param {Object} dailyValues - Daily recommended values
   */
  renderAll(food, portions, dailyValues) {
    this._renderHeader(food, portions);
    this._renderHealthScore(food);
    this._renderMacros(food, portions);
    this._renderNutritionRows(food, portions, dailyValues);
    this._renderBenefitsWarnings(food);
  },

  _renderHeader(food, portions) {
    document.getElementById('resultEmoji').textContent = food.emoji;
    document.getElementById('resultName').textContent = food.name;
    document.getElementById('resultCategory').textContent = food.category;
    document.getElementById('portionWeight').textContent =
      `${Math.round(food.servingSize * portions)}g`;
  },

  _renderHealthScore(food) {
    const score = food.healthScore;
    const ring = document.getElementById('healthScoreRing');
    const circumference = 326.7;

    document.getElementById('healthScoreValue').textContent = score;
    document.getElementById('healthScoreRingNum').textContent = score;

    // Determine tier
    let tier, color;
    if      (score >= 90) { tier = { label: 'Excellent', color: '#00d4aa', desc: 'Nutrient-dense superfood with exceptional health benefits' }; }
    else if (score >= 75) { tier = { label: 'Very Good', color: '#4ade80', desc: 'Highly nutritious with significant health benefits' }; }
    else if (score >= 60) { tier = { label: 'Good',      color: '#a3e635', desc: 'Nutritious with moderate health benefits' }; }
    else if (score >= 45) { tier = { label: 'Fair',      color: '#fbbf24', desc: 'Some nutritional value but consume in moderation' }; }
    else                  { tier = { label: 'Poor',      color: '#f87171', desc: 'Low nutritional value — limit consumption' }; }

    document.getElementById('healthScoreBadge').textContent = tier.label;
    document.getElementById('healthScoreBadge').style.background = `${tier.color}22`;
    document.getElementById('healthScoreBadge').style.color = tier.color;
    document.getElementById('healthScoreDesc').textContent = tier.desc;
    document.getElementById('healthScoreValue').style.color = tier.color;
    document.getElementById('healthScoreRingNum').style.color = tier.color;
    ring.style.stroke = tier.color;

    // Animate ring
    setTimeout(() => {
      const offset = circumference - (score / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }, 200);
  },

  _renderMacros(food, portions) {
    const n = food.nutrition;
    const p = portions;

    this._animateNumber('macroCalVal', Math.round(n.calories * p));
    this._animateNumber('macroProtVal', +(n.protein * p).toFixed(1));
    this._animateNumber('macroCarbVal', +(n.carbohydrates * p).toFixed(1));
    this._animateNumber('macroFatVal', +(n.fat * p).toFixed(1));
  },

  _renderNutritionRows(food, portions, dailyValues) {
    const container = document.getElementById('nutritionRows');
    container.innerHTML = '';

    this._rows.forEach((row, i) => {
      const rawVal = food.nutrition[row.key] || 0;
      const val = +(rawVal * portions).toFixed(1);
      const dv = dailyValues[row.dvKey];
      const pct = dv ? Math.min(Math.round((val / dv) * 100), 150) : 0;

      const el = document.createElement('div');
      el.className = 'nutrition-row';
      el.style.animationDelay = `${i * 0.06}s`;
      el.innerHTML = `
        <div class="row-label">
          <span class="row-icon">${row.icon}</span>
          ${row.label}
        </div>
        <div class="row-bar-wrap">
          <div class="row-bar" data-target="${pct}" style="background: ${row.color}; width: 0%"></div>
        </div>
        <div class="row-val">
          ${val} ${row.unit}
          ${dv ? `<div class="row-dv">${pct}% DV</div>` : ''}
        </div>
      `;
      container.appendChild(el);
    });

    // Animate bars after DOM paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.querySelectorAll('.row-bar').forEach(bar => {
          bar.style.width = `${bar.dataset.target}%`;
        });
      });
    });
  },

  _renderBenefitsWarnings(food) {
    const benefitsList = document.getElementById('benefitsList');
    const warningsList = document.getElementById('warningsList');

    benefitsList.innerHTML = food.benefits
      .map(b => `<li>${b}</li>`)
      .join('');
    warningsList.innerHTML = food.warnings
      .map(w => `<li>${w}</li>`)
      .join('');
  },

  /**
   * Update numeric values when portion changes (no re-render of full UI)
   */
  updatePortion(food, portions, dailyValues) {
    this._renderMacros(food, portions);
    this._renderNutritionRows(food, portions, dailyValues);
    document.getElementById('portionWeight').textContent =
      `${Math.round(food.servingSize * portions)}g`;
  },

  /** Animate a number counting up */
  _animateNumber(elId, target) {
    const el = document.getElementById(elId);
    if (!el) return;
    const start = parseFloat(el.textContent) || 0;
    const duration = 700;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = start + (target - start) * eased;
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
};


/* ══════════════════════════════════════════════
   DAILY LOG
══════════════════════════════════════════════ */
const DailyLog = {
  _entries: [],
  _dailyValues: null,

  init(dailyValues) {
    this._dailyValues = dailyValues;
    this._loadFromStorage();
    this._bindEvents();
    this._renderLog();
  },

  _loadFromStorage() {
    try {
      const stored = localStorage.getItem('nutriscan_daily_log');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only keep today's entries
        const today = new Date().toDateString();
        this._entries = parsed.filter(e => e.date === today);
        this._saveToStorage();
      }
    } catch { this._entries = []; }
  },

  _saveToStorage() {
    try {
      localStorage.setItem('nutriscan_daily_log', JSON.stringify(this._entries));
    } catch {}
  },

  _bindEvents() {
    document.getElementById('clearLogBtn')?.addEventListener('click', () => {
      this._entries = [];
      this._saveToStorage();
      this._renderLog();
      Toast.show('Daily log cleared', 'info');
    });
  },

  addEntry(food, portions) {
    const entry = {
      id: Date.now(),
      date: new Date().toDateString(),
      foodId: food.id,
      foodName: food.name,
      emoji: food.emoji,
      portions,
      servingUnit: food.servingUnit,
      calories: Math.round(food.nutrition.calories * portions),
      nutrition: Object.fromEntries(
        Object.entries(food.nutrition).map(([k, v]) => [k, +(v * portions).toFixed(1)])
      )
    };
    this._entries.push(entry);
    this._saveToStorage();
    this._renderLog();
    Toast.show(`${food.emoji} ${food.name} added to daily log!`, 'success');
  },

  removeEntry(id) {
    this._entries = this._entries.filter(e => e.id !== id);
    this._saveToStorage();
    this._renderLog();
    Toast.show('Entry removed', 'info', 1500);
  },

  _getTotals() {
    const totals = {};
    const keys = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber',
                  'sugar', 'sodium', 'potassium', 'calcium', 'iron', 'vitaminC', 'vitaminA', 'cholesterol'];
    keys.forEach(k => { totals[k] = 0; });
    this._entries.forEach(entry => {
      keys.forEach(k => { totals[k] += entry.nutrition[k] || 0; });
    });
    return totals;
  },

  _renderLog() {
    const empty = document.getElementById('dailyEmpty');
    const content = document.getElementById('dailyContent');

    if (this._entries.length === 0) {
      empty.style.display = 'block';
      content.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    content.style.display = 'block';

    this._renderEntries();
    this._renderTotals();
  },

  _renderEntries() {
    const container = document.getElementById('logEntries');
    container.innerHTML = '';

    this._entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'log-entry-item';
      el.innerHTML = `
        <div class="log-entry-emoji">${entry.emoji}</div>
        <div class="log-entry-info">
          <div class="log-entry-name">${entry.foodName}</div>
          <div class="log-entry-meta">${entry.portions}× ${entry.servingUnit}</div>
        </div>
        <div class="log-entry-cal">${entry.calories} kcal</div>
        <button class="btn-remove-log" data-id="${entry.id}" title="Remove">
          <i class="ph ph-x"></i>
        </button>
      `;
      container.appendChild(el);
    });

    // Bind remove buttons
    container.querySelectorAll('.btn-remove-log').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.removeEntry(id);
      });
    });
  },

  _renderTotals() {
    const container = document.getElementById('dailyBars');
    const totals = this._getTotals();
    container.innerHTML = '';

    const bars = [
      { key: 'calories',      label: 'Calories',    unit: 'kcal', dvKey: 'calories'     },
      { key: 'protein',       label: 'Protein',      unit: 'g',    dvKey: 'protein'      },
      { key: 'carbohydrates', label: 'Carbs',        unit: 'g',    dvKey: 'carbohydrates'},
      { key: 'fat',           label: 'Fat',          unit: 'g',    dvKey: 'fat'          },
      { key: 'fiber',         label: 'Fiber',        unit: 'g',    dvKey: 'fiber'        },
      { key: 'sodium',        label: 'Sodium',       unit: 'mg',   dvKey: 'sodium'       },
      { key: 'calcium',       label: 'Calcium',      unit: 'mg',   dvKey: 'calcium'      },
      { key: 'iron',          label: 'Iron',         unit: 'mg',   dvKey: 'iron'         },
    ];

    bars.forEach(bar => {
      const val = +(totals[bar.key] || 0).toFixed(1);
      const dv = this._dailyValues[bar.dvKey];
      const pct = dv ? Math.min((val / dv) * 100, 150) : 0;
      const isOver = pct >= 110;
      const isWarn = pct >= 85 && pct < 110;
      const fillClass = isOver ? 'over' : (isWarn ? 'warn' : '');

      const el = document.createElement('div');
      el.className = 'daily-bar-row';
      el.innerHTML = `
        <div class="daily-bar-label">${bar.label}</div>
        <div class="daily-bar-track">
          <div class="daily-bar-fill ${fillClass}" style="width: 0%" data-target="${Math.min(pct, 100)}"></div>
        </div>
        <div class="daily-bar-num">${val}${bar.unit}</div>
      `;
      container.appendChild(el);
    });

    // Animate bars
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.querySelectorAll('.daily-bar-fill').forEach(bar => {
          bar.style.width = `${bar.dataset.target}%`;
        });
      });
    });
  }
};


/* ══════════════════════════════════════════════
   MAIN APP CONTROLLER
══════════════════════════════════════════════ */
const NutriScanApp = {
  _db: null,
  _currentFood: null,
  _portions: 1,
  _stream: null, // camera stream

  async init() {
    // Initialize subsystems
    Toast.init();
    ThemeManager.init();

    // Load database
    this._db = await DataLoader.load();
    if (!this._db) return;

    DailyLog.init(this._db.dailyValues);

    // Build quick-pick tags
    this._buildQuickPicks();

    // Bind all events
    this._bindNavScroll();
    this._bindUpload();
    this._bindSearch();
    this._bindPortion();
    this._bindAddToLog();

    console.log('[NutriScan] Initialized with', this._db.foods.length, 'foods.');
  },

  // ── Navigation ──────────────────────────────
  _bindNavScroll() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  },

  // ── Quick Picks ──────────────────────────────
  _buildQuickPicks() {
    const container = document.getElementById('quickTags');
    const picks = this._db.foods.slice(0, 6);
    picks.forEach(food => {
      const tag = document.createElement('button');
      tag.className = 'quick-tag';
      tag.innerHTML = `${food.emoji} ${food.name}`;
      tag.addEventListener('click', () => {
        this._selectFood(food);
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
      });
      container.appendChild(tag);
    });
  },

  // ── Upload & Camera ──────────────────────────
  _bindUpload() {
    const zone      = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const removeBtn = document.getElementById('removeImg');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const closeCamBtn = document.getElementById('closeCameraBtn');
    const captureBtn = document.getElementById('captureBtn');

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this._previewImage(file);
    });

    // Drag & drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        this._previewImage(file);
      } else {
        Toast.show('Please drop a valid image file.', 'error');
      }
    });

    // Remove image
    removeBtn.addEventListener('click', () => this._clearPreview());

    // Analyze button
    analyzeBtn.addEventListener('click', () => this._runAIAnalysis());

    // Camera buttons
    cameraBtn.addEventListener('click', () => this._openCamera());
    closeCamBtn.addEventListener('click', () => this._closeCamera());
    captureBtn.addEventListener('click', () => this._capturePhoto());
  },

  _previewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('previewImg');
      img.src = e.target.result;
      document.getElementById('uploadIdle').style.display = 'none';
      document.getElementById('uploadPreview').style.display = 'block';
      document.getElementById('analyzeAction').style.display = 'block';
      // Store the data URL for potential API use
      this._imageDataURL = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  _clearPreview() {
    document.getElementById('uploadIdle').style.display = 'flex';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('analyzeAction').style.display = 'none';
    document.getElementById('fileInput').value = '';
    this._imageDataURL = null;
  },

  async _openCamera() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    modal.style.display = 'flex';

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = this._stream;
    } catch (err) {
      Toast.show('Camera access denied. Please allow camera permission.', 'error');
      this._closeCamera();
    }
  },

  _closeCamera() {
    document.getElementById('cameraModal').style.display = 'none';
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
  },

  _capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (blob) {
        this._previewImage(blob);
        this._closeCamera();
        Toast.show('Photo captured!', 'success', 2000);
      }
    }, 'image/jpeg', 0.9);
  },

  // ── AI Analysis ──────────────────────────────
  async _runAIAnalysis() {
    // Show scanning animation on preview
    document.getElementById('uploadPreview').classList.add('scanning');

    // Show analyzing state
    document.getElementById('analyzeAction').style.display = 'none';
    document.getElementById('analyzingState').style.display = 'block';

    try {
      // Run AI analysis (simulated, or replace with real API)
      const food = await AIAnalyzer.analyze(this._imageDataURL, this._db.foods);

      if (food) {
        this._selectFood(food);
        Toast.show(`Detected: ${food.emoji} ${food.name}`, 'success', 3000);
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
      } else {
        Toast.show('Could not identify the food. Try searching manually.', 'error');
      }
    } catch (err) {
      console.error('[NutriScan] Analysis error:', err);
      Toast.show('Analysis failed. Please try again.', 'error');
    } finally {
      // Reset UI
      document.getElementById('analyzingState').style.display = 'none';
      document.getElementById('uploadPreview').classList.remove('scanning');
      document.getElementById('analyzeAction').style.display = 'block';
    }
  },

  // ── Search ────────────────────────────────────
  _bindSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    const suggestions = document.getElementById('searchSuggestions');

    let debounceTimer;

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearBtn.style.display = q ? 'flex' : 'none';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this._showSuggestions(q), 200);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        const food = this._searchFood(q);
        if (food) {
          this._selectFood(food);
          this._clearSearch();
          document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        } else {
          Toast.show('Food not found. Try another name.', 'error');
        }
        suggestions.innerHTML = '';
      }
      if (e.key === 'Escape') {
        suggestions.innerHTML = '';
        input.blur();
      }
    });

    clearBtn.addEventListener('click', () => {
      this._clearSearch();
      suggestions.innerHTML = '';
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrap')) {
        suggestions.innerHTML = '';
      }
    });
  },

  _clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').style.display = 'none';
  },

  _searchFood(query) {
    if (!query || !this._db) return null;
    const q = query.toLowerCase().trim();
    return this._db.foods.find(food =>
      food.name.toLowerCase().includes(q) ||
      food.aliases.some(alias => alias.includes(q) || q.includes(alias))
    ) || null;
  },

  _showSuggestions(query) {
    const container = document.getElementById('searchSuggestions');
    container.innerHTML = '';
    if (!query || !this._db) return;

    const q = query.toLowerCase();
    const matches = this._db.foods.filter(food =>
      food.name.toLowerCase().includes(q) ||
      food.aliases.some(alias => alias.includes(q))
    ).slice(0, 5);

    matches.forEach(food => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <span class="sug-emoji">${food.emoji}</span>
        <div class="sug-info">
          <div class="sug-name">${food.name}</div>
          <div class="sug-cat">${food.category}</div>
        </div>
        <div class="sug-cal">${food.nutrition.calories} kcal</div>
      `;
      item.addEventListener('click', () => {
        this._selectFood(food);
        this._clearSearch();
        container.innerHTML = '';
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
      });
      container.appendChild(item);
    });
  },

  // ── Food Selection ────────────────────────────
  _selectFood(food) {
    this._currentFood = food;
    this._portions = 1;

    // Reset portion display
    document.getElementById('portionValue').textContent = 1;
    document.getElementById('portionUnit').textContent = food.servingUnit;

    // Render everything
    NutritionRenderer.renderAll(food, this._portions, this._db.dailyValues);

    // Show results section
    const section = document.getElementById('results-section');
    section.style.display = 'block';
    section.style.animation = 'none';
    void section.offsetWidth; // force reflow
    section.style.animation = '';
  },

  // ── Portion Control ───────────────────────────
  _bindPortion() {
    document.getElementById('portionDown').addEventListener('click', () => {
      if (this._portions > 0.5) {
        this._portions = Math.max(0.5, +(this._portions - 0.5).toFixed(1));
        this._updatePortion();
      }
    });
    document.getElementById('portionUp').addEventListener('click', () => {
      if (this._portions < 10) {
        this._portions = Math.min(10, +(this._portions + 0.5).toFixed(1));
        this._updatePortion();
      }
    });
  },

  _updatePortion() {
    if (!this._currentFood) return;
    document.getElementById('portionValue').textContent = this._portions;
    NutritionRenderer.updatePortion(this._currentFood, this._portions, this._db.dailyValues);
  },

  // ── Add to Daily Log ──────────────────────────
  _bindAddToLog() {
    document.getElementById('addToLogBtn').addEventListener('click', () => {
      if (!this._currentFood) return;
      DailyLog.addEntry(this._currentFood, this._portions);
      document.getElementById('daily-summary').scrollIntoView({ behavior: 'smooth' });
    });
  }
};


/* ══════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  NutriScanApp.init();
});
