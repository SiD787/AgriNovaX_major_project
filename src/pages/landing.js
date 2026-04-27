/**
 * Landing Page - with i18n support & language switcher
 */
import { t, getLanguage, getSupportedLanguages } from '../utils/i18n.js';
import { langSwitcherDropdown } from './components.js';

export function renderLanding(app, { navigate }) {
  const lang = getLanguage();

  app.innerHTML = `
    <div class="app-layout app-layout--public">
      <!-- Navbar -->
      <nav class="navbar" id="landing-navbar">
        <a class="navbar__logo" href="#/">
          <span class="material-symbols-outlined" style="color:var(--primary)">eco</span>
          Agri<span>NovaX</span>
        </a>
        <div class="navbar__links">
          <a class="navbar__link navbar__link--active" href="#/">${t('nav_home')}</a>
          <a class="navbar__link" href="#/features">${t('nav_features')}</a>
          <a class="navbar__link" href="#/weather">${t('nav_weather')}</a>
          <a class="navbar__link" href="#/about">${t('nav_about')}</a>
          <a class="navbar__link" href="#/support">${t('nav_support')}</a>
          ${langSwitcherDropdown()}
          <button class="navbar__cta" onclick="agriNavigate('input')">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">agriculture</span>
            ${t('nav_start')}
          </button>
        </div>
      </nav>

      <!-- Hero -->
      <section class="hero" style="padding-top:calc(var(--navbar-height) + 40px)">
        <div class="hero__content animate-fade-in-up">
          <div class="hero__overline">
            <span class="material-symbols-outlined" style="font-size:16px">auto_awesome</span>
            ${t('hero_overline')}
          </div>
          <h1 class="hero__title">
            ${t('hero_title_1')} <span>${t('hero_title_2')}</span>
          </h1>
          <p class="hero__subtitle">${t('hero_subtitle')}</p>
          <div class="hero__actions">
            <button class="btn btn--primary btn--lg" onclick="agriNavigate('input')" id="cta-start">
              <span class="material-symbols-outlined">rocket_launch</span>
              ${t('hero_cta')}
            </button>
            <button class="btn btn--outline btn--lg" onclick="agriNavigate('features')" id="cta-features">
              ${t('hero_explore')}
            </button>
          </div>
          <div style="display:flex;gap:var(--space-2xl);margin-top:var(--space-2xl)">
            <div class="metric animate-fade-in-up" style="animation-delay:200ms">
              <div class="metric__value">22+</div>
              <div class="metric__label">${t('hero_crops')}</div>
            </div>
            <div class="metric animate-fade-in-up" style="animation-delay:300ms">
              <div class="metric__value">99.7%</div>
              <div class="metric__label">${t('hero_accuracy')}</div>
            </div>
            <div class="metric animate-fade-in-up" style="animation-delay:400ms">
              <div class="metric__value">7</div>
              <div class="metric__label">${t('hero_languages')}</div>
            </div>
          </div>
        </div>
        <div class="hero__visual">
          <div style="width:500px;height:500px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--primary-surface) 0%, rgba(61,102,49,0.2) 100%);display:flex;align-items:center;justify-content:center;">
            <span class="material-symbols-outlined" style="font-size:200px;color:var(--primary);opacity:0.3">agriculture</span>
          </div>
        </div>
      </section>

      <!-- Features Bento Grid -->
      <section style="padding:var(--space-2xl) var(--space-2xl);max-width:1200px;margin:0 auto;">
        <div class="section-header" style="text-align:center;">
          <div class="section-header__overline">${t('section_offer')}</div>
          <h2 class="section-header__title">${t('section_offer_title')}</h2>
          <p class="section-header__subtitle">${t('section_offer_subtitle')}</p>
        </div>
        <div class="grid grid--3 animate-stagger" style="margin-top:var(--space-xl)">
          ${[
            { icon: 'science', title: t('feat_soil'), desc: t('feat_soil_desc') },
            { icon: 'grass', title: t('feat_crop'), desc: t('feat_crop_desc') },
            { icon: 'payments', title: t('feat_profit'), desc: t('feat_profit_desc') },
            { icon: 'cloud', title: t('feat_weather'), desc: t('feat_weather_desc') },
            { icon: 'record_voice_over', title: t('feat_voice'), desc: t('feat_voice_desc') },
            { icon: 'eco', title: t('feat_improve'), desc: t('feat_improve_desc') },
          ].map(f => `
            <div class="card card--elevated card--interactive" style="padding:var(--space-xl)">
              <div class="card__icon" style="background:var(--primary-surface);color:var(--primary);margin-bottom:var(--space-md)">
                <span class="material-symbols-outlined">${f.icon}</span>
              </div>
              <h3 style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-sm)">${f.title}</h3>
              <p style="font-size:var(--text-sm);color:var(--on-surface-variant);line-height:1.6">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- How it Works -->
      <section style="padding:var(--space-2xl) var(--space-2xl);background:var(--surface-container-low)">
        <div style="max-width:1200px;margin:0 auto;">
          <div class="section-header" style="text-align:center;">
            <div class="section-header__overline">${t('how_title')}</div>
            <h2 class="section-header__title">${t('how_subtitle')}</h2>
          </div>
          <div class="grid grid--3" style="margin-top:var(--space-xl)">
            ${[
              { num: '01', icon: 'edit_note', title: t('step1_title'), desc: t('step1_desc') },
              { num: '02', icon: 'psychology', title: t('step2_title'), desc: t('step2_desc') },
              { num: '03', icon: 'insights', title: t('step3_title'), desc: t('step3_desc') },
            ].map(s => `
              <div style="text-align:center;padding:var(--space-xl)">
                <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-md);font-size:var(--text-xl);font-weight:800">${s.num}</div>
                <span class="material-symbols-outlined" style="font-size:36px;color:var(--primary);margin-bottom:var(--space-sm)">${s.icon}</span>
                <h3 style="font-size:var(--text-lg);font-weight:600;margin:var(--space-sm) 0">${s.title}</h3>
                <p style="font-size:var(--text-sm);color:var(--on-surface-variant)">${s.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section style="padding:var(--space-2xl) var(--space-2xl);text-align:center;">
        <div style="max-width:600px;margin:0 auto;">
          <h2 style="font-size:var(--text-3xl);font-weight:700;margin-bottom:var(--space-md)">${t('cta_ready')}</h2>
          <p style="font-size:var(--text-lg);color:var(--on-surface-variant);margin-bottom:var(--space-xl)">${t('cta_subtitle')}</p>
          <button class="btn btn--primary btn--lg" onclick="agriNavigate('input')">
            <span class="material-symbols-outlined">arrow_forward</span>
            ${t('cta_button')}
          </button>
        </div>
      </section>

      <!-- Footer -->
      <footer style="padding:var(--space-xl) var(--space-2xl);background:var(--surface-container-low);text-align:center;">
        <p style="font-size:var(--text-sm);color:var(--on-surface-muted)">${t('footer')}</p>
      </footer>
    </div>
  `;

  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('landing-navbar');
    if (navbar) navbar.classList.toggle('navbar--scrolled', window.scrollY > 20);
  });
}
