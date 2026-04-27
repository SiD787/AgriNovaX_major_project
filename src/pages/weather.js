/**
 * Weather Page - with i18n
 */
import { sidebar } from './components.js';
import { t } from '../utils/i18n.js';
import { getWeather } from '../utils/api.js';

export function renderWeather(app, { navigate, state }) {
  app.innerHTML = `
    <div class="app-layout">
      ${sidebar('weather')}
      <main class="main-content page-enter">
        <div class="section-header">
          <div class="section-header__overline">${t('weather_overline')}</div>
          <h1 class="section-header__title">${t('weather_title')}</h1>
          <p class="section-header__subtitle">${t('weather_subtitle')}</p>
        </div>
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <form id="weather-form" style="display:flex;gap:var(--space-md);align-items:flex-end">
            <div class="form-group" style="flex:1">
              <label class="form-label" for="w-location">${t('weather_location')}</label>
              <input class="form-input" id="w-location" type="text" placeholder="e.g. Nagpur" value="Nagpur" />
            </div>
            <button type="submit" class="btn btn--primary">
              <span class="material-symbols-outlined">search</span>
              ${t('weather_search')}
            </button>
          </form>
        </div>
        <div id="weather-content">
          <div class="empty-state" style="padding:var(--space-2xl)">
            <span class="material-symbols-outlined empty-state__icon">cloud</span>
            <p class="empty-state__text">${t('weather_prompt')}</p>
          </div>
        </div>
      </main>
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>
      <button class="mobile-toggle" onclick="toggleSidebar()"><span class="material-symbols-outlined">menu</span></button>
    </div>
  `;

  document.getElementById('weather-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.getElementById('w-location').value;
    if (!location) return;
    const content = document.getElementById('weather-content');
    content.innerHTML = '<div class="loader"><div class="loader__spinner"></div><p class="loader__text">...</p></div>';
    try {
      const data = await getWeather(location);
      renderWeatherData(content, data);
    } catch {
      content.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined empty-state__icon">cloud_off</span><h2 class="empty-state__title">${t('weather_unavailable')}</h2><p class="empty-state__text">${t('weather_unavailable_desc')}</p></div>`;
    }
  });

  window.toggleSidebar = () => {
    document.querySelector('.sidebar').classList.toggle('sidebar--open');
    document.getElementById('sidebar-overlay').classList.toggle('sidebar-overlay--visible');
  };
}

function renderWeatherData(container, data) {
  const c = data.current || {};
  const forecast = data.forecast || [];
  const soil = data.soil_conditions || {};
  const loc = data.location || {};
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  container.innerHTML = `
    <div class="card card--primary" style="margin-bottom:var(--space-lg);position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-30px;opacity:0.1"><span class="material-symbols-outlined" style="font-size:150px">${c.icon||'partly_cloudy_day'}</span></div>
      <div style="position:relative;z-index:1">
        <p style="font-size:var(--text-sm);opacity:0.8;margin-bottom:var(--space-xs)">${loc.name||'Unknown'}, ${loc.country||'India'}</p>
        <div style="display:flex;align-items:flex-end;gap:var(--space-xl);flex-wrap:wrap">
          <div>
            <p style="font-size:clamp(3rem,8vw,5rem);font-weight:800;line-height:1">${c.temperature||28}°</p>
            <p style="font-size:var(--text-lg);opacity:0.9">${c.condition||'Clear'}</p>
          </div>
          <div style="display:flex;gap:var(--space-xl);flex-wrap:wrap">
            <div><p style="font-size:var(--text-xs);opacity:0.7;text-transform:uppercase">${t('weather_humidity')}</p><p style="font-size:var(--text-xl);font-weight:700">${c.humidity||0}%</p></div>
            <div><p style="font-size:var(--text-xs);opacity:0.7;text-transform:uppercase">${t('weather_rain')}</p><p style="font-size:var(--text-xl);font-weight:700">${c.rain||0}mm</p></div>
            <div><p style="font-size:var(--text-xs);opacity:0.7;text-transform:uppercase">${t('weather_wind')}</p><p style="font-size:var(--text-xl);font-weight:700">${c.wind_speed||0}km/h</p></div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid--2" style="margin-bottom:var(--space-lg)">
      <div class="card card--elevated">
        <div class="card__header"><h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)"><span class="material-symbols-outlined" style="color:var(--primary)">grass</span>${t('weather_soil')}</h2></div>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <div style="display:flex;justify-content:space-between;padding:var(--space-sm) 0"><span style="font-size:var(--text-sm);color:var(--on-surface-variant)">${t('weather_moisture')}</span><span class="badge ${soil.moisture==='Adequate'?'badge--success':soil.moisture==='Dry'?'badge--danger':'badge--warning'}">${soil.moisture||'N/A'}</span></div>
          <div style="display:flex;justify-content:space-between;padding:var(--space-sm) 0"><span style="font-size:var(--text-sm);color:var(--on-surface-variant)">${t('weather_soil_temp')}</span><span style="font-weight:600">${soil.temperature||'N/A'}</span></div>
          <div style="display:flex;justify-content:space-between;padding:var(--space-sm) 0"><span style="font-size:var(--text-sm);color:var(--on-surface-variant)">${t('weather_status')}</span><span class="badge ${soil.status==='Good'?'badge--success':'badge--warning'}">${soil.status||'N/A'}</span></div>
        </div>
      </div>
      <div class="card card--elevated">
        <div class="card__header"><h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)"><span class="material-symbols-outlined" style="color:var(--primary)">psychology</span>${t('weather_insight')}</h2></div>
        <p style="font-size:var(--text-sm);color:var(--on-surface-variant);line-height:1.7">${data.insight||''}</p>
      </div>
    </div>
    ${forecast.length>0?`
    <div class="card card--elevated">
      <div class="card__header"><h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)"><span class="material-symbols-outlined" style="color:var(--primary)">calendar_month</span>${t('weather_forecast')}</h2></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--space-md)">
        ${forecast.map((f,i)=>{const d=new Date(f.date);return`
          <div style="text-align:center;padding:var(--space-md);background:${i===0?'var(--primary-surface)':'var(--surface-container-low)'};border-radius:var(--radius-md)">
            <p style="font-size:var(--text-xs);font-weight:600;color:${i===0?'var(--primary)':'var(--on-surface-muted)'};text-transform:uppercase">${i===0?t('weather_today'):days[d.getDay()]||''}</p>
            <p style="font-size:var(--text-xs);color:var(--on-surface-muted)">${d.getDate()}/${d.getMonth()+1}</p>
            <span class="material-symbols-outlined" style="font-size:32px;color:var(--primary);margin:var(--space-sm) 0">${f.icon||'sunny'}</span>
            <p style="font-size:var(--text-sm);font-weight:600">${f.temp_max?.toFixed(0)||0}° / ${f.temp_min?.toFixed(0)||0}°</p>
            <p style="font-size:var(--text-xs);color:var(--on-surface-muted)">${f.precipitation?.toFixed(1)||0}mm</p>
          </div>`;}).join('')}
      </div>
    </div>`:''}
  `;
}
