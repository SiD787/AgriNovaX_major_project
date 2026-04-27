/**
 * Shared Components - Language switcher, sidebar, navbar
 */
import { t, getLanguage, getSupportedLanguages } from '../utils/i18n.js';

/**
 * Language switcher dropdown for navbar (FIXED: uses proper toggle)
 */
export function langSwitcherDropdown() {
  const languages = getSupportedLanguages();
  const current = getLanguage();
  const currentLang = languages.find(l => l.code === current);
  
  return `
    <div class="lang-switcher" style="position:relative">
      <button class="btn btn--ghost btn--sm" onclick="agriToggleLangDropdown()" style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm)">
        <span class="material-symbols-outlined" style="font-size:18px">translate</span>
        ${currentLang?.native || 'English'}
        <span class="material-symbols-outlined" style="font-size:16px">expand_more</span>
      </button>
      <div id="lang-dropdown" class="lang-dropdown" style="position:absolute;top:100%;right:0;background:white;border-radius:var(--radius-md);box-shadow:0 8px 30px rgba(0,0,0,0.15);min-width:180px;z-index:500;display:none;overflow:hidden;margin-top:4px">
        ${languages.map(l => `
          <button onclick="agriSetLanguage('${l.code}')" 
            class="lang-option"
            style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 16px;font-size:13px;text-align:left;border:none;cursor:pointer;transition:background 0.15s;background:${l.code === current ? 'var(--primary-surface,#f0f7ed)' : 'white'};color:${l.code === current ? 'var(--primary,#3D6631)' : '#333'};font-weight:${l.code === current ? '600' : '400'}"
            onmouseover="this.style.background='${l.code === current ? 'var(--primary-surface,#f0f7ed)' : '#f5f5f5'}'"
            onmouseout="this.style.background='${l.code === current ? 'var(--primary-surface,#f0f7ed)' : 'white'}'">
            <span style="min-width:32px;font-size:14px">${l.native}</span>
            <span style="color:#888;font-size:12px">${l.name}</span>
            ${l.code === current ? '<span class="material-symbols-outlined" style="font-size:16px;margin-left:auto;color:var(--primary,#3D6631)">check</span>' : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Sidebar component with language switcher (voice button opens floating assistant)
 */
export function sidebar(active) {
  const links = [
    { id: 'input', icon: 'edit_note', label: t('side_input') },
    { id: 'dashboard', icon: 'dashboard', label: t('side_dashboard') },
    { id: 'weather', icon: 'cloud', label: t('side_weather') },
  ];
  
  const languages = getSupportedLanguages();
  const current = getLanguage();
  
  return `
    <aside class="sidebar">
      <a class="sidebar__logo" href="#/">
        <div class="sidebar__logo-icon"><span class="material-symbols-outlined" style="font-size:20px">eco</span></div>
        <div class="sidebar__logo-text">Agri<span>NovaX</span></div>
      </a>

      <!-- Sidebar Language Switcher -->
      <div style="margin-bottom:var(--space-lg)">
        <label style="font-size:var(--text-xs);font-weight:600;color:var(--on-surface-muted);text-transform:uppercase;letter-spacing:0.06em;display:flex;align-items:center;gap:var(--space-xs);margin-bottom:var(--space-xs)">
          <span class="material-symbols-outlined" style="font-size:14px">translate</span>
          ${t('lang_switch')}
        </label>
        <select class="form-select" style="width:100%;padding:var(--space-sm) var(--space-md);font-size:var(--text-sm)" onchange="agriSetLanguage(this.value)">
          ${languages.map(l => `<option value="${l.code}" ${l.code === current ? 'selected' : ''}>${l.native} (${l.name})</option>`).join('')}
        </select>
      </div>

      <nav class="sidebar__nav">
        ${links.map(l => `
          <a class="sidebar__link ${l.id === active ? 'sidebar__link--active' : ''}" href="#/${l.id}">
            <span class="material-symbols-outlined">${l.icon}</span>
            ${l.label}
          </a>
        `).join('')}
        <div class="sidebar__divider"></div>
        <a class="sidebar__link" href="#/features">
          <span class="material-symbols-outlined">auto_awesome</span>
          ${t('side_features')}
        </a>
        <a class="sidebar__link" href="#/about">
          <span class="material-symbols-outlined">info</span>
          ${t('side_about')}
        </a>
        <a class="sidebar__link" href="#/support">
          <span class="material-symbols-outlined">help</span>
          ${t('side_support')}
        </a>
      </nav>
      <button class="sidebar__voice-btn" onclick="document.getElementById('va-fab')?.click()">
        <span class="material-symbols-outlined">mic</span>
        ${t('side_voice')}
      </button>
    </aside>
  `;
}

/**
 * Public navbar with language switcher
 */
export function publicNavbar(activePage) {
  const pages = [
    { id: '', label: t('nav_home') },
    { id: 'features', label: t('nav_features') },
    { id: 'weather', label: t('nav_weather') },
    { id: 'about', label: t('nav_about') },
    { id: 'support', label: t('nav_support') },
  ];

  return `
    <nav class="navbar" id="public-navbar">
      <a class="navbar__logo" href="#/">
        <span class="material-symbols-outlined" style="color:var(--primary)">eco</span>
        Agri<span>NovaX</span>
      </a>
      <div class="navbar__links">
        ${pages.map(p => `
          <a class="navbar__link ${p.id === activePage ? 'navbar__link--active' : ''}" href="#/${p.id}">${p.label}</a>
        `).join('')}
        ${langSwitcherDropdown()}
        <button class="navbar__cta" onclick="agriNavigate('input')">${t('nav_start')}</button>
      </div>
    </nav>
  `;
}
