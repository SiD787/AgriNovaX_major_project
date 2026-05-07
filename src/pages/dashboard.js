/**
 * Dashboard Page - With i18n (voice assistant is now the floating widget)
 */
import { sidebar } from './components.js';
import { t, getLanguage } from '../utils/i18n.js';
import { generatePDFReport } from '../utils/pdfReport.js';

export function renderDashboard(app, { navigate, state }) {
  const results = state.get('results');

  if (!results) {
    app.innerHTML = `
      <div class="app-layout">
        ${sidebar('dashboard')}
        <main class="main-content page-enter">
          <div class="empty-state">
            <span class="material-symbols-outlined empty-state__icon">analytics</span>
            <h2 class="empty-state__title">${t('dash_no_analysis')}</h2>
            <p class="empty-state__text">${t('dash_no_analysis_desc')}</p>
            <button class="btn btn--primary" onclick="agriNavigate('input')">
              <span class="material-symbols-outlined">edit_note</span>
              ${t('dash_enter_data')}
            </button>
          </div>
        </main>
        <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>
        <button class="mobile-toggle" onclick="toggleSidebar()"><span class="material-symbols-outlined">menu</span></button>
      </div>
    `;
    window.toggleSidebar = () => {
      document.querySelector('.sidebar').classList.toggle('sidebar--open');
      document.getElementById('sidebar-overlay').classList.toggle('sidebar-overlay--visible');
    };
    return;
  }

  const r = results;
  const sh = r.soil_health || {};
  const rec = r.recommendation || {};
  const econ = r.economics || {};
  const soil = r.soil_improvement || {};
  const voice = r.voice || {};
  const params = r.parameter_table || [];
  const alts = r.alternatives || [];
  const multi = r.multi_cropping || [];

  const healthBadge = sh.health === 'Healthy' ? 'badge--success' : sh.health === 'Moderate' ? 'badge--warning' : 'badge--danger';

  app.innerHTML = `
    <div class="app-layout">
      ${sidebar('dashboard')}
      <main class="main-content page-enter" id="dashboard-content">
        <div class="section-header">
          <div class="section-header__overline">${t('dash_overline')}</div>
          <h1 class="section-header__title">${t('dash_title')}</h1>
        </div>

        <!-- Top: Soil Health + Recommendation -->
        <div class="grid grid--2" style="margin-bottom:var(--space-lg)">
          <div class="card card--elevated">
            <div class="card__header">
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
                <span class="material-symbols-outlined" style="color:var(--primary)">monitor_heart</span>
                ${t('dash_soil_health')}
              </h2>
              <span class="badge ${healthBadge}">${sh.health || 'N/A'}</span>
            </div>
            <p style="font-size:var(--text-sm);color:var(--on-surface-variant);margin-bottom:var(--space-lg)">${sh.description || ''}</p>
            <div style="display:flex;gap:var(--space-xl)">
              <div class="metric">
                <div class="metric__value">${sh.confidence_score || 0}%</div>
                <div class="metric__label">${t('dash_confidence')}</div>
              </div>
              <div class="metric">
                <div class="metric__value" style="color:${sh.risk_level === 'Low' ? 'var(--success)' : sh.risk_level === 'Medium' ? 'var(--warning)' : 'var(--danger)'}">${sh.risk_level || 'N/A'}</div>
                <div class="metric__label">${t('dash_risk')}</div>
              </div>
            </div>
          </div>

          <div class="card card--primary" style="position:relative;overflow:hidden">
            <div style="position:absolute;top:-20px;right:-20px;font-size:120px;opacity:0.1"><span class="material-symbols-outlined" style="font-size:120px">agriculture</span></div>
            <div class="card__header" style="position:relative;z-index:1">
              <h2 class="card__title" style="color:var(--on-primary)">${t('dash_recommended')}</h2>
              <span class="badge" style="background:rgba(255,255,255,0.2);color:white">${rec.confidence || 0}% ${t('dash_match')}</span>
            </div>
            <div style="position:relative;z-index:1">
              <p style="font-size:var(--text-4xl);font-weight:800;margin-bottom:var(--space-sm)">${rec.display_name || 'N/A'}</p>
              <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-top:var(--space-md)">
                ${(rec.reasons || []).map(r => `<span style="padding:4px 10px;background:rgba(255,255,255,0.15);border-radius:var(--radius-full);font-size:var(--text-xs);color:rgba(255,255,255,0.9)">${r}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Alternatives -->
        ${alts.length > 0 ? `
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <div class="card__header">
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
              <span class="material-symbols-outlined" style="color:var(--primary)">compare_arrows</span>
              ${t('dash_alternatives')}
            </h2>
          </div>
          <div style="display:flex;gap:var(--space-md);flex-wrap:wrap">
            ${alts.map(a => `
              <div class="card" style="flex:1;min-width:150px;text-align:center">
                <p style="font-size:var(--text-lg);font-weight:600">${a.crop.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                <p style="font-size:var(--text-sm);color:var(--on-surface-muted)">${a.confidence}% ${t('dash_match').toLowerCase()}</p>
                <div class="progress" style="margin-top:var(--space-sm)"><div class="progress__fill" style="width:${a.confidence}%"></div></div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Parameter Table -->
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <div class="card__header">
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
              <span class="material-symbols-outlined" style="color:var(--primary)">table_chart</span>
              ${t('dash_params')}
            </h2>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>${t('dash_param')}</th><th>${t('dash_current')}</th><th>${t('dash_target')}</th><th>${t('dash_status')}</th></tr></thead>
              <tbody>
                ${params.map(p => {
                  const sc = p.status === 'Optimal' ? 'var(--success)' : p.status.includes('Deficit') ? 'var(--warning)' : 'var(--danger)';
                  const sb = p.status === 'Optimal' ? 'var(--success-light)' : p.status.includes('Deficit') ? 'var(--warning-light)' : 'var(--danger-light)';
                  return `<tr><td style="font-weight:500">${p.parameter}</td><td>${p.current}</td><td style="color:var(--on-surface-muted)">${p.target}</td><td><span class="badge" style="background:${sb};color:${sc}">${p.status}</span></td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Economics -->
        <div class="grid grid--2" style="margin-bottom:var(--space-lg)">
          <div class="card card--elevated">
            <div class="card__header">
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
                <span class="material-symbols-outlined" style="color:var(--warning)">account_balance</span>
                ${t('dash_investment')}
              </h2>
            </div>
            <table class="data-table"><tbody>
              ${(econ.cost_table || []).map(c => `<tr><td>${c.item}</td><td style="text-align:right;font-weight:600">₹${(c.amount || 0).toLocaleString()}</td></tr>`).join('')}
              <tr style="border-top:2px solid var(--surface-container-high)"><td style="font-weight:700">${t('dash_total_invest')}</td><td style="text-align:right;font-weight:700;color:var(--primary)">${econ.summary?.total_cost_formatted || '₹0'}</td></tr>
            </tbody></table>
          </div>
          <div class="card card--elevated">
            <div class="card__header">
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
                <span class="material-symbols-outlined" style="color:var(--success)">trending_up</span>
                ${t('dash_profit_proj')}
              </h2>
              <span class="badge badge--success">${econ.summary?.profitability_tag || ''}</span>
            </div>
            <table class="data-table"><tbody>
              ${(econ.profit_table || []).map(p => `<tr><td>${p.item}</td><td style="text-align:right;font-weight:600">${p.value}</td></tr>`).join('')}
            </tbody></table>
          </div>
        </div>

        <!-- Soil Tips -->
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <div class="card__header">
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
              <span class="material-symbols-outlined" style="color:var(--primary)">tips_and_updates</span>
              ${t('dash_soil_tips')}
            </h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
            ${(soil.soil_tips || []).map((tip, i) => `
              <div style="display:flex;align-items:flex-start;gap:var(--space-md);padding:var(--space-md);background:${i === 0 ? 'var(--primary-surface)' : 'var(--surface-container-low)'};border-radius:var(--radius-md)">
                <span class="material-symbols-outlined" style="color:var(--primary);font-size:20px;margin-top:2px">${i === 0 ? 'priority_high' : 'check_circle'}</span>
                <p style="font-size:var(--text-sm);line-height:1.6">${tip}</p>
              </div>
            `).join('')}
          </div>
        </div>

        ${(soil.recommendations || []).length > 0 ? `
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <div class="card__header">
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
              <span class="material-symbols-outlined" style="color:var(--warning)">build</span>
              ${t('dash_fertilizer')}
            </h2>
          </div>
          <div class="grid grid--2" style="gap:var(--space-md)">
            ${(soil.recommendations || []).map(r => `
              <div class="card" style="display:flex;align-items:flex-start;gap:var(--space-md)">
                <div class="card__icon" style="background:var(--warning-light);color:var(--warning)"><span class="material-symbols-outlined">${r.icon || 'science'}</span></div>
                <div>
                  <p style="font-weight:600;margin-bottom:var(--space-xs)">${r.action}</p>
                  <p style="font-size:var(--text-sm);color:var(--on-surface-variant)">${r.detail}</p>
                  <span class="badge ${r.priority === 'High' ? 'badge--danger' : 'badge--warning'}" style="margin-top:var(--space-sm)">${r.priority} ${t('dash_priority')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${multi.length > 0 ? `
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <div class="card__header">
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
              <span class="material-symbols-outlined" style="color:var(--primary)">grid_view</span>
              ${t('dash_multi')}
            </h2>
          </div>
          <div style="display:flex;gap:var(--space-md);flex-wrap:wrap">
            ${multi.map(m => `<div style="padding:var(--space-sm) var(--space-lg);background:var(--primary-surface);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:600;color:var(--primary)">${m.display_name}</div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Voice Report (read-only, voice assistant handles speaking) -->
        <div class="card card--elevated" style="margin-bottom:var(--space-lg)">
          <div class="card__header">
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-sm)">
              <span class="material-symbols-outlined" style="color:var(--primary)">record_voice_over</span>
              ${t('dash_voice_report')} (${voice.language_name || 'English'})
            </h2>
            <span class="badge badge--primary" style="cursor:pointer" onclick="document.getElementById('va-fab')?.click()" title="Open Voice Assistant">
              <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">mic</span>
              ${t('dash_ask_assistant')}
            </span>
          </div>
          <div style="background:var(--surface-container-low);border-radius:var(--radius-md);padding:var(--space-lg)">
            ${(voice.lines || []).map(line => `<p style="font-size:var(--text-sm);margin-bottom:var(--space-sm);line-height:1.7">${line}</p>`).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-2xl)">
          <button class="btn btn--outline" onclick="agriNavigate('input')">
            <span class="material-symbols-outlined">arrow_back</span>
            ${t('dash_new_analysis')}
          </button>
          <button class="btn btn--primary" id="download-pdf-btn" onclick="agriDownloadPDF()">
            <span class="material-symbols-outlined">picture_as_pdf</span>
            ${t('dash_download')}
          </button>
        </div>
      </main>
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>
      <button class="mobile-toggle" onclick="toggleSidebar()"><span class="material-symbols-outlined">menu</span></button>
    </div>
  `;

  window.toggleSidebar = () => {
    document.querySelector('.sidebar').classList.toggle('sidebar--open');
    document.getElementById('sidebar-overlay').classList.toggle('sidebar-overlay--visible');
  };

  window.agriDownloadPDF = () => {
    generatePDFReport(results);
  };
}
