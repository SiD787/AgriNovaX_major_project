/**
 * Input Page - with i18n support
 */
import { predictCrop } from '../utils/api.js';
import { t, getLanguage } from '../utils/i18n.js';
import { sidebar } from './components.js';

export function renderInput(app, { navigate, state }) {
  app.innerHTML = `
    <div class="app-layout">
      ${sidebar('input')}
      <main class="main-content page-enter">
        <div class="section-header">
          <div class="section-header__overline">${t('input_overline')}</div>
          <h1 class="section-header__title">${t('input_title')}</h1>
          <p class="section-header__subtitle">${t('input_subtitle')}</p>
        </div>

        <form id="predict-form" style="max-width:900px;">
          <!-- Soil Nutrients -->
          <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
            <div class="card__header">
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
                <span class="material-symbols-outlined" style="color:var(--primary)">science</span>
                ${t('input_soil_title')}
              </h2>
              <span class="badge badge--primary">${t('input_required')}</span>
            </div>
            <div class="grid grid--3" style="gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label" for="input-n">${t('input_n')}</label>
                <input class="form-input" id="input-n" type="number" placeholder="e.g. 80" min="0" max="200" step="1" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-p">${t('input_p')}</label>
                <input class="form-input" id="input-p" type="number" placeholder="e.g. 45" min="0" max="200" step="1" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-k">${t('input_k')}</label>
                <input class="form-input" id="input-k" type="number" placeholder="e.g. 40" min="0" max="200" step="1" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-ph">${t('input_ph')}</label>
                <input class="form-input" id="input-ph" type="number" placeholder="e.g. 6.5" min="0" max="14" step="0.1" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-moisture">${t('input_moisture')}</label>
                <input class="form-input" id="input-moisture" type="number" placeholder="e.g. 60" min="0" max="100" step="1" />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-conductivity">${t('input_conductivity')}</label>
                <input class="form-input" id="input-conductivity" type="number" placeholder="e.g. 1.2" min="0" max="20" step="0.1" />
              </div>
            </div>
          </div>

          <!-- Weather -->
          <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
            <div class="card__header">
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
                <span class="material-symbols-outlined" style="color:var(--primary)">thermostat</span>
                ${t('input_weather_title')}
              </h2>
              <span class="badge badge--primary">${t('input_required')}</span>
            </div>
            <div class="grid grid--3" style="gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label" for="input-temp">${t('input_temp')}</label>
                <input class="form-input" id="input-temp" type="number" placeholder="e.g. 25" min="-10" max="55" step="0.1" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-humidity">${t('input_humidity')}</label>
                <input class="form-input" id="input-humidity" type="number" placeholder="e.g. 65" min="0" max="100" step="0.1" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-rainfall">${t('input_rainfall')}</label>
                <input class="form-input" id="input-rainfall" type="number" placeholder="e.g. 200" min="0" max="500" step="0.1" required />
              </div>
            </div>
          </div>

          <!-- Farm Details -->
          <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
            <div class="card__header">
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
                <span class="material-symbols-outlined" style="color:var(--primary)">landscape</span>
                ${t('input_farm_title')}
              </h2>
              <span class="badge badge--info">${t('input_optional')}</span>
            </div>
            <div class="grid grid--3" style="gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label" for="input-area">${t('input_area')}</label>
                <input class="form-input" id="input-area" type="number" placeholder="e.g. 2" min="0.1" max="1000" step="0.1" value="1" />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-location">${t('input_location')}</label>
                <input class="form-input" id="input-location" type="text" placeholder="e.g. Nagpur, Maharashtra" />
              </div>
              <div class="form-group">
                <label class="form-label" for="input-language">${t('input_language')}</label>
                <select class="form-select" id="input-language">
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div style="display:flex;gap:var(--space-md);align-items:center">
            <button type="submit" class="btn btn--primary btn--lg" id="submit-btn">
              <span class="material-symbols-outlined">psychology</span>
              ${t('input_submit')}
            </button>
            <div id="error-msg" style="color:var(--danger);font-size:var(--text-sm);display:none"></div>
          </div>
        </form>

        <!-- Loading Overlay -->
        <div id="loading-overlay" style="display:none;position:fixed;inset:0;background:rgba(248,247,244,0.9);z-index:999;backdrop-filter:blur(10px)">
          <div class="loader" style="height:100vh">
            <div class="loader__spinner"></div>
            <p class="loader__text" style="font-size:var(--text-lg);font-weight:600">${t('input_analyzing')}</p>
            <p style="font-size:var(--text-sm);color:var(--on-surface-muted)">${t('input_processing')}</p>
          </div>
        </div>
      </main>
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>
      <button class="mobile-toggle" onclick="toggleSidebar()">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
  `;

  // Set voice language to match UI language
  const langSelect = document.getElementById('input-language');
  if (langSelect) langSelect.value = getLanguage();

  // Form submission
  document.getElementById('predict-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none';

    const data = {
      N: parseFloat(document.getElementById('input-n').value),
      P: parseFloat(document.getElementById('input-p').value),
      K: parseFloat(document.getElementById('input-k').value),
      temperature: parseFloat(document.getElementById('input-temp').value),
      humidity: parseFloat(document.getElementById('input-humidity').value),
      ph: parseFloat(document.getElementById('input-ph').value),
      rainfall: parseFloat(document.getElementById('input-rainfall').value),
      land_area: parseFloat(document.getElementById('input-area').value) || 1,
      location: document.getElementById('input-location').value || null,
      language: document.getElementById('input-language').value,
      moisture: parseFloat(document.getElementById('input-moisture').value) || null,
      conductivity: parseFloat(document.getElementById('input-conductivity').value) || null,
    };

    document.getElementById('loading-overlay').style.display = 'block';

    try {
      const results = await predictCrop(data);
      state.set('inputData', data);
      state.set('results', results);
      navigate('dashboard');
    } catch (err) {
      document.getElementById('loading-overlay').style.display = 'none';
      errorMsg.textContent = `Error: ${err.message}. Make sure the backend is running (python main.py).`;
      errorMsg.style.display = 'block';
    }
  });

  window.toggleSidebar = () => {
    document.querySelector('.sidebar').classList.toggle('sidebar--open');
    document.getElementById('sidebar-overlay').classList.toggle('sidebar-overlay--visible');
  };
}
