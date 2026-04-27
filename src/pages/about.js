/**
 * About Page - with i18n
 */
import { t } from '../utils/i18n.js';
import { publicNavbar } from './components.js';

export function renderAbout(app, { navigate }) {
  app.innerHTML = `
    <div class="app-layout app-layout--public">
      ${publicNavbar('about')}
      <section style="padding:calc(var(--navbar-height) + 60px) var(--space-2xl) var(--space-3xl);max-width:1000px;margin:0 auto">
        <div class="section-header" style="text-align:center;margin-bottom:var(--space-2xl)">
          <div class="section-header__overline">${t('about_overline')}</div>
          <h1 style="font-size:var(--text-4xl);font-weight:800;margin-bottom:var(--space-md)">${t('about_title')}</h1>
          <p class="section-header__subtitle" style="max-width:600px;margin:0 auto">${t('about_subtitle')}</p>
        </div>
        <div class="card card--elevated" style="padding:var(--space-2xl);margin-bottom:var(--space-xl)">
          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
            <div class="card__icon" style="background:var(--primary-surface);color:var(--primary)"><span class="material-symbols-outlined">flag</span></div>
            <h2 style="font-size:var(--text-2xl);font-weight:700">${t('about_story')}</h2>
          </div>
          <p style="font-size:var(--text-base);color:var(--on-surface-variant);line-height:1.8;margin-bottom:var(--space-lg)">${t('about_story_p1')}</p>
          <p style="font-size:var(--text-base);color:var(--on-surface-variant);line-height:1.8">${t('about_story_p2')}</p>
        </div>
        <div class="grid grid--2" style="margin-bottom:var(--space-xl)">
          <div class="card card--elevated" style="padding:var(--space-xl)">
            <div class="card__icon" style="background:var(--primary-surface);color:var(--primary);margin-bottom:var(--space-md)"><span class="material-symbols-outlined">visibility</span></div>
            <h3 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-sm)">${t('about_vision')}</h3>
            <p style="font-size:var(--text-sm);color:var(--on-surface-variant);line-height:1.7">${t('about_vision_desc')}</p>
          </div>
          <div class="card card--elevated" style="padding:var(--space-xl)">
            <div class="card__icon" style="background:var(--success-light);color:var(--success);margin-bottom:var(--space-md)"><span class="material-symbols-outlined">target</span></div>
            <h3 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-sm)">${t('about_goal')}</h3>
            <p style="font-size:var(--text-sm);color:var(--on-surface-variant);line-height:1.7">${t('about_goal_desc')}</p>
          </div>
        </div>
        <div class="card card--primary" style="padding:var(--space-2xl)">
          <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:var(--space-xl)">
            ${[{v:'22+',l:t('about_stat_crops')},{v:'99.7%',l:t('about_stat_accuracy')},{v:'7',l:t('about_stat_lang')},{v:'2,200+',l:t('about_stat_data')}].map(s=>`
              <div style="text-align:center"><p style="font-size:var(--text-4xl);font-weight:800">${s.v}</p><p style="font-size:var(--text-sm);opacity:0.8">${s.l}</p></div>`).join('')}
          </div>
        </div>
      </section>
      <footer style="padding:var(--space-xl) var(--space-2xl);background:var(--surface-container-low);text-align:center"><p style="font-size:var(--text-sm);color:var(--on-surface-muted)">${t('footer')}</p></footer>
    </div>
  `;
}
