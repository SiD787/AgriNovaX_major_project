/**
 * Support Page - with i18n
 */
import { t } from '../utils/i18n.js';
import { publicNavbar } from './components.js';

export function renderSupport(app, { navigate }) {
  const faqs = [
    { q: 'How accurate are the crop recommendations?', a: 'Our Random Forest model achieves 99.7% accuracy on test data, trained on 2,200+ samples across 22 crop varieties.' },
    { q: 'What soil parameters do I need?', a: 'At minimum: Nitrogen (N), Phosphorus (P), Potassium (K), temperature, humidity, pH, and rainfall. Get these from any agriculture extension office.' },
    { q: 'Is AgriNovaX free?', a: 'Yes, AgriNovaX is completely free for all Indian farmers.' },
    { q: 'Which languages are supported?', a: 'English, Hindi, Marathi, Tamil, Telugu, Kannada, and Bengali — for both the interface and voice output.' },
    { q: 'How are profit estimates calculated?', a: 'Using current MSP and average market prices, multiplied by expected yield per acre for the recommended crop.' },
    { q: 'Can I use this on mobile?', a: 'Yes! AgriNovaX is fully responsive and works on any smartphone, tablet or desktop.' },
    { q: 'Where does weather data come from?', a: 'From the Open-Meteo API — free and accurate weather forecasts globally.' },
    { q: 'How do I interpret Risk Level?', a: 'Low = parameters match well. Medium = some adjustments needed. High = significant soil amendments recommended before planting.' },
  ];

  app.innerHTML = `
    <div class="app-layout app-layout--public">
      ${publicNavbar('support')}
      <section style="padding:calc(var(--navbar-height) + 60px) var(--space-2xl) var(--space-3xl);max-width:900px;margin:0 auto">
        <div class="section-header" style="text-align:center;margin-bottom:var(--space-2xl)">
          <div class="section-header__overline">${t('support_overline')}</div>
          <h1 style="font-size:var(--text-4xl);font-weight:800;margin-bottom:var(--space-md)">${t('support_title')}</h1>
          <p class="section-header__subtitle">${t('support_subtitle')}</p>
        </div>
        <div class="card card--elevated" style="padding:var(--space-xl);margin-bottom:var(--space-xl)">
          <h2 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-lg);display:flex;align-items:center;gap:var(--space-sm)">
            <span class="material-symbols-outlined" style="color:var(--primary)">quiz</span>
            ${t('support_faq')}
          </h2>
          ${faqs.map((faq, i) => `
            <div class="accordion__item">
              <button class="accordion__trigger" onclick="toggleFaq(${i})" id="faq-trigger-${i}">
                <span>${faq.q}</span>
                <span class="material-symbols-outlined">expand_more</span>
              </button>
              <div class="accordion__content" id="faq-content-${i}">
                <div class="accordion__body">${faq.a}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="grid grid--2" style="gap:var(--space-lg)">
          <div class="card card--elevated" style="padding:var(--space-xl);text-align:center">
            <span class="material-symbols-outlined" style="font-size:48px;color:var(--primary);margin-bottom:var(--space-md)">mail</span>
            <h3 style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-sm)">${t('support_email')}</h3>
            <p style="font-size:var(--text-sm);color:var(--on-surface-variant);margin-bottom:var(--space-md)">${t('support_email_desc')}</p>
            <a href="mailto:support@agrinovax.ai" class="btn btn--outline btn--sm">support@agrinovax.ai</a>
          </div>
          <div class="card card--elevated" style="padding:var(--space-xl);text-align:center">
            <span class="material-symbols-outlined" style="font-size:48px;color:var(--primary);margin-bottom:var(--space-md)">call</span>
            <h3 style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-sm)">${t('support_phone')}</h3>
            <p style="font-size:var(--text-sm);color:var(--on-surface-variant);margin-bottom:var(--space-md)">${t('support_phone_desc')}</p>
            <a href="tel:1800-180-1551" class="btn btn--outline btn--sm">1800-180-1551</a>
          </div>
        </div>
      </section>
      <footer style="padding:var(--space-xl) var(--space-2xl);background:var(--surface-container-low);text-align:center"><p style="font-size:var(--text-sm);color:var(--on-surface-muted)">${t('footer')}</p></footer>
    </div>
  `;

  window.toggleFaq = (index) => {
    const trigger = document.getElementById('faq-trigger-' + index);
    const content = document.getElementById('faq-content-' + index);
    const isOpen = content.classList.contains('accordion__content--open');
    document.querySelectorAll('.accordion__content').forEach(c => c.classList.remove('accordion__content--open'));
    document.querySelectorAll('.accordion__trigger').forEach(t => t.classList.remove('accordion__trigger--open'));
    if (!isOpen) {
      content.classList.add('accordion__content--open');
      trigger.classList.add('accordion__trigger--open');
    }
  };
}
