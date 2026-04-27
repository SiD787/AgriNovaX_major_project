/**
 * AgriNovaX Frontend - Main Entry Point
 * Hash-based SPA router with global state, i18n & voice assistant
 */
import './styles/index.css';
import { renderLanding } from './pages/landing.js';
import { renderInput } from './pages/input.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderWeather } from './pages/weather.js';
import { renderFeatures } from './pages/features.js';
import { renderAbout } from './pages/about.js';
import { renderSupport } from './pages/support.js';
import { state } from './utils/state.js';
import { setLanguage, getLanguage, getSupportedLanguages } from './utils/i18n.js';
import { initVoiceAssistant } from './utils/voice.js';

const routes = {
  '': renderLanding,
  'input': renderInput,
  'dashboard': renderDashboard,
  'weather': renderWeather,
  'features': renderFeatures,
  'about': renderAbout,
  'support': renderSupport,
};

function getRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return hash || '';
}

function navigate(path) {
  window.location.hash = `#/${path}`;
}

function render() {
  const route = getRoute();
  const renderFn = routes[route] || renderLanding;
  const app = document.getElementById('app');
  
  app.innerHTML = '';
  renderFn(app, { navigate, state });
  window.scrollTo(0, 0);

  // Initialize voice assistant on every page
  initVoiceAssistant();

  // Close any open lang dropdowns on click outside
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('lang-dropdown');
    if (dd && !e.target.closest('.lang-switcher')) {
      dd.style.display = 'none';
    }
  });
}

// Language change handler
window.agriSetLanguage = (lang) => {
  setLanguage(lang);
  render();
};

window.agriGetLanguage = getLanguage;
window.agriLanguages = getSupportedLanguages;

// Toggle language dropdown 
window.agriToggleLangDropdown = () => {
  const dd = document.getElementById('lang-dropdown');
  if (dd) {
    dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
  }
};

// Listen for hash changes
window.addEventListener('hashchange', render);

// Initial render
render();

// Make navigate available globally
window.agriNavigate = navigate;
window.agriState = state;
