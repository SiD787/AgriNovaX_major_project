/**
 * Features Page - with i18n
 */
import { t } from '../utils/i18n.js';
import { publicNavbar } from './components.js';

export function renderFeatures(app, { navigate }) {
  const features = [
    { icon: 'science', title: t('feat_soil'), desc: t('feat_soil_desc'), tag: 'ML' },
    { icon: 'grass', title: t('feat_crop'), desc: t('feat_crop_desc'), tag: 'Core' },
    { icon: 'payments', title: t('feat_profit'), desc: t('feat_profit_desc'), tag: '₹' },
    { icon: 'record_voice_over', title: t('feat_voice'), desc: t('feat_voice_desc'), tag: '7 Lang' },
    { icon: 'cloud', title: t('feat_weather'), desc: t('feat_weather_desc'), tag: 'Live' },
    { icon: 'eco', title: t('feat_improve'), desc: t('feat_improve_desc'), tag: 'NPK' },
  ];

  app.innerHTML = `
    <div class="app-layout app-layout--public">
      ${publicNavbar('features')}
      <section style="padding:calc(var(--navbar-height) + 60px) var(--space-2xl) var(--space-3xl);max-width:1200px;margin:0 auto">
        <div class="section-header" style="text-align:center;margin-bottom:var(--space-2xl)">
          <div class="section-header__overline">${t('features_overline')}</div>
          <h1 style="font-size:var(--text-4xl);font-weight:800;margin-bottom:var(--space-md)">${t('features_title')}</h1>
          <p class="section-header__subtitle" style="max-width:600px;margin:0 auto">${t('features_subtitle')}</p>
        </div>
        <div class="grid grid--2 animate-stagger" style="gap:var(--space-xl)">
          ${features.map(f => `
            <div class="card card--elevated card--interactive" style="padding:var(--space-xl)">
              <div style="display:flex;align-items:flex-start;gap:var(--space-lg)">
                <div class="card__icon" style="background:var(--primary-surface);color:var(--primary);flex-shrink:0"><span class="material-symbols-outlined">${f.icon}</span></div>
                <div>
                  <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm)">
                    <h3 style="font-size:var(--text-lg);font-weight:600">${f.title}</h3>
                    <span class="badge badge--primary">${f.tag}</span>
                  </div>
                  <p style="font-size:var(--text-sm);color:var(--on-surface-variant);line-height:1.7">${f.desc}</p>
                </div>
              </div>
            </div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:var(--space-3xl)">
          <button class="btn btn--primary btn--lg" onclick="agriNavigate('input')"><span class="material-symbols-outlined">rocket_launch</span>${t('features_try')}</button>
        </div>
      </section>
      <footer style="padding:var(--space-xl) var(--space-2xl);background:var(--surface-container-low);text-align:center"><p style="font-size:var(--text-sm);color:var(--on-surface-muted)">${t('footer')}</p></footer>
    </div>
  `;
}
