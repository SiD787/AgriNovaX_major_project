/**
 * AgriNovaX PDF Report Generator
 * Opens a clean, beautifully-styled printable report in a new window.
 * Works perfectly for both browser Print and Save as PDF.
 */

export function generatePDFReport(results) {
  const r = results;
  const sh = r.soil_health || {};
  const rec = r.recommendation || {};
  const econ = r.economics || {};
  const soil = r.soil_improvement || {};
  const voice = r.voice || {};
  const params = r.parameter_table || [];
  const alts = r.alternatives || [];
  const multi = r.multi_cropping || [];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const riskColor = sh.risk_level === 'Low' ? '#2e7d32' : sh.risk_level === 'Medium' ? '#f57f17' : '#c62828';
  const riskBg   = sh.risk_level === 'Low' ? '#e8f5e9' : sh.risk_level === 'Medium' ? '#fff8e1' : '#ffebee';
  const healthColor = sh.health === 'Healthy' ? '#2e7d32' : sh.health === 'Moderate' ? '#f57f17' : '#c62828';
  const healthBg    = sh.health === 'Healthy' ? '#e8f5e9' : sh.health === 'Moderate' ? '#fff8e1' : '#ffebee';

  const paramRows = params.map(p => {
    const statusColor = p.status === 'Optimal' ? '#2e7d32' : p.status.includes('Deficit') ? '#f57f17' : '#c62828';
    const statusBg    = p.status === 'Optimal' ? '#e8f5e9'  : p.status.includes('Deficit') ? '#fff8e1'  : '#ffebee';
    return `
      <tr>
        <td style="font-weight:600;padding:10px 14px;border-bottom:1px solid #f0f0f0">${p.parameter}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0">${p.current}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#666">${p.target}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0">
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.04em;background:${statusBg};color:${statusColor}">${p.status}</span>
        </td>
      </tr>`;
  }).join('');

  const costRows = (econ.cost_table || []).map(c =>
    `<tr><td style="padding:9px 14px;border-bottom:1px solid #f0f0f0">${c.item}</td><td style="padding:9px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">₹${(c.amount || 0).toLocaleString()}</td></tr>`
  ).join('');

  const profitRows = (econ.profit_table || []).map(p =>
    `<tr><td style="padding:9px 14px;border-bottom:1px solid #f0f0f0">${p.item}</td><td style="padding:9px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${p.value}</td></tr>`
  ).join('');

  const tipsHTML = (soil.soil_tips || []).map((tip, i) =>
    `<div style="display:flex;gap:10px;padding:10px 14px;margin-bottom:8px;background:${i === 0 ? '#e8f0e5' : '#f8f8f5'};border-radius:10px;${i === 0 ? 'border-left:4px solid #3d6631' : ''}">
       <span style="color:#3d6631;font-size:16px;margin-top:1px">${i === 0 ? '★' : '✓'}</span>
       <p style="font-size:13px;line-height:1.6;color:#333;margin:0">${tip}</p>
     </div>`
  ).join('');

  const recHTML = (soil.recommendations || []).map(rec =>
    `<div style="display:flex;gap:12px;padding:12px 14px;background:#fff8e1;border-radius:10px;margin-bottom:8px;border-left:4px solid #f57f17">
       <span style="color:#f57f17;font-size:18px">⚗</span>
       <div>
         <p style="font-weight:700;margin:0 0 4px;font-size:13px">${rec.action}</p>
         <p style="font-size:12px;color:#555;margin:0">${rec.detail}</p>
         <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:${rec.priority === 'High' ? '#ffebee' : '#fff8e1'};color:${rec.priority === 'High' ? '#c62828' : '#f57f17'}">${rec.priority} Priority</span>
       </div>
     </div>`
  ).join('');

  const altHTML = alts.length > 0
    ? alts.map(a =>
        `<div style="flex:1;min-width:120px;padding:12px;background:#f8f8f5;border-radius:10px;text-align:center">
           <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#3d6631">${a.crop.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
           <p style="font-size:12px;color:#888;margin:0 0 8px">${a.confidence}% match</p>
           <div style="height:6px;background:#e0e0e0;border-radius:999px;overflow:hidden">
             <div style="height:100%;width:${a.confidence}%;background:#3d6631;border-radius:999px"></div>
           </div>
         </div>`
      ).join('')
    : '';

  const multiHTML = multi.length > 0
    ? multi.map(m =>
        `<span style="display:inline-block;padding:6px 16px;background:#e8f0e5;border-radius:999px;font-size:12px;font-weight:700;color:#3d6631;margin:4px">${m.display_name}</span>`
      ).join('')
    : '';

  const voiceHTML = (voice.lines || []).map(line =>
    `<p style="font-size:13px;line-height:1.7;color:#444;margin-bottom:8px">${line}</p>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AgriNovaX Report – ${rec.display_name || 'Crop Advisory'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, Arial, sans-serif;
      background: #fff;
      color: #1a1c1a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { max-width: 800px; margin: 0 auto; padding: 40px 44px; }

    /* Header */
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding-bottom: 24px; border-bottom: 3px solid #3d6631; margin-bottom: 28px;
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 44px; height: 44px; background: #3d6631; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 22px;
    }
    .logo-text h1 { font-size: 22px; font-weight: 800; color: #1a1c1a; }
    .logo-text h1 span { color: #3d6631; }
    .logo-text p { font-size: 11px; color: #777; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 2px; }
    .header-meta { text-align: right; }
    .header-meta p { font-size: 12px; color: #888; }
    .header-meta strong { font-size: 13px; color: #333; }

    /* Section title */
    .section-title {
      font-size: 15px; font-weight: 700; color: #3d6631;
      text-transform: uppercase; letter-spacing: 0.06em;
      margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;
    }
    .section-title::after { content: ''; flex: 1; height: 1px; background: #e0e0e0; }

    /* Highlight boxes */
    .hero-box {
      background: linear-gradient(135deg, #3d6631 0%, #4a7a3b 100%);
      border-radius: 14px; padding: 24px 28px; color: #fff; margin-bottom: 20px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .hero-crop { font-size: 36px; font-weight: 900; }
    .hero-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.8; margin-bottom: 4px; }
    .hero-badge {
      background: rgba(255,255,255,0.2); border-radius: 999px;
      padding: 6px 16px; font-size: 14px; font-weight: 700;
    }

    /* Stats row */
    .stats-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .stat-box {
      flex: 1; background: #f8f8f5; border-radius: 12px; padding: 16px 18px;
      border-left: 4px solid #3d6631;
    }
    .stat-val { font-size: 26px; font-weight: 800; color: #3d6631; }
    .stat-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: #f0f4ee; color: #3d6631; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      padding: 10px 14px; text-align: left;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card { background: #f8f8f5; border-radius: 12px; padding: 18px 16px; }
    .card-title { font-size: 13px; font-weight: 700; color: #444; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }

    /* Reasons tags */
    .reasons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .reason-tag {
      padding: 4px 12px; background: rgba(61,102,49,0.12); border-radius: 999px;
      font-size: 11px; font-weight: 600; color: #3d6631;
    }

    /* Footer */
    .footer {
      margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer p { font-size: 10px; color: #aaa; }

    /* Print page breaks */
    @media print {
      body { background: #fff !important; }
      .page { padding: 24px 32px; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }

    /* Print button (hidden on print) */
    .print-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 999;
      background: #3d6631; color: #fff; padding: 12px 24px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .print-bar span { font-size: 14px; font-weight: 600; }
    .print-btn {
      background: #fff; color: #3d6631; border: none; cursor: pointer;
      padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 700;
    }
    .print-btn:hover { background: #e8f0e5; }
    .print-spacer { height: 52px; }
  </style>
</head>
<body>
  <!-- Print Bar -->
  <div class="print-bar no-print">
    <span>🌿 AgriNovaX – Crop Advisory Report</span>
    <button class="print-btn" onclick="window.print()">⬇ Print / Save as PDF</button>
  </div>
  <div class="print-spacer no-print"></div>

  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <div class="logo-icon">🌿</div>
        <div class="logo-text">
          <h1>Agri<span>NovaX</span></h1>
          <p>AI-Powered Smart Farming Advisory</p>
        </div>
      </div>
      <div class="header-meta">
        <p>Report Generated</p>
        <strong>${dateStr}</strong><br>
        <p style="margin-top:4px">Soil & Crop Analysis Report</p>
      </div>
    </div>

    <!-- Hero: Recommended Crop -->
    <div class="hero-box">
      <div>
        <div class="hero-label">Recommended Crop</div>
        <div class="hero-crop">${rec.display_name || 'N/A'}</div>
        <div class="reasons">
          ${(rec.reasons || []).map(r => `<span class="reason-tag" style="background:rgba(255,255,255,0.2);color:#fff">${r}</span>`).join('')}
        </div>
      </div>
      <div style="text-align:right">
        <div class="hero-label">Confidence Score</div>
        <div class="hero-badge">${rec.confidence || 0}% Match</div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-val" style="color:${healthColor}">${sh.health || 'N/A'}</div>
        <div class="stat-lbl">Soil Health</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" style="color:${riskColor}">${sh.risk_level || 'N/A'}</div>
        <div class="stat-lbl">Risk Level</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${sh.confidence_score || 0}%</div>
        <div class="stat-lbl">Confidence</div>
      </div>
      <div class="stat-box" style="border-color:#f57f17">
        <div class="stat-val" style="color:#f57f17">${econ.summary?.total_cost_formatted || '₹0'}</div>
        <div class="stat-lbl">Total Investment</div>
      </div>
    </div>

    ${sh.description ? `<p style="font-size:13px;color:#555;margin-bottom:20px;line-height:1.7;padding:12px 16px;background:#f8f8f5;border-radius:10px">${sh.description}</p>` : ''}

    <!-- Parameter Table -->
    <div class="section-title">📊 Soil Parameter Analysis</div>
    <table style="margin-bottom:20px">
      <thead>
        <tr>
          <th>Parameter</th><th>Your Value</th><th>Ideal Range</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${paramRows}
      </tbody>
    </table>

    <!-- Economics -->
    <div class="section-title">💰 Financial Summary</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title">📋 Investment Breakdown</div>
        <table>
          <tbody>
            ${costRows}
            <tr style="background:#e8f0e5">
              <td style="padding:9px 14px;font-weight:800;color:#3d6631">Total Investment</td>
              <td style="padding:9px 14px;text-align:right;font-weight:800;color:#3d6631">${econ.summary?.total_cost_formatted || '₹0'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title">📈 Profit Projection <span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700">${econ.summary?.profitability_tag || ''}</span></div>
        <table>
          <tbody>
            ${profitRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Soil Tips -->
    <div class="section-title">💡 Soil Improvement Tips</div>
    <div style="margin-bottom:20px">${tipsHTML}</div>

    ${(soil.recommendations || []).length > 0 ? `
    <div class="section-title">⚗ Fertilizer Recommendations</div>
    <div style="margin-bottom:20px">${recHTML}</div>` : ''}

    ${alts.length > 0 ? `
    <div class="section-title">🔄 Alternative Crops</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">${altHTML}</div>` : ''}

    ${multi.length > 0 ? `
    <div class="section-title">🌾 Companion / Multi-Cropping</div>
    <div style="margin-bottom:20px">${multiHTML}</div>` : ''}

    ${voice.lines && voice.lines.length > 0 ? `
    <div class="page-break"></div>
    <div class="section-title">🎙 Advisory Summary (${voice.language_name || 'English'})</div>
    <div style="background:#f8f8f5;border-radius:12px;padding:18px 20px;margin-bottom:20px">
      ${voiceHTML}
    </div>` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Generated by AgriNovaX AI Platform &bull; For agricultural guidance only</p>
      <p>${dateStr}</p>
    </div>
  </div>
</body>
</html>`;

  // Open in new window and auto-trigger print
  const win = window.open('', '_blank', 'width=900,height=800,scrollbars=yes');
  win.document.write(html);
  win.document.close();
  win.focus();
}
