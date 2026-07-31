import { DELIVERABLES } from './deliverables.js';

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return Number(n).toLocaleString('id-ID');
}

function pct(part, total) {
  return total ? Math.round(part / total * 100) : 0;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseDistribution(jsonStr, labelKey) {
  try {
    if (!jsonStr) return [];
    const parsed = JSON.parse(String(jsonStr).trim());
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        label: String(item[labelKey] ?? '—'),
        pct: (item.percentage ?? 0) * 100,
      }))
      .sort((a, b) => b.pct - a.pct);
  } catch {
    return null;
  }
}

function formatReportDate(raw) {
  const s = String(raw ?? '');
  if (/^\d{8}$/.test(s)) {
    const y = Number(s.slice(0, 4));
    const m = Number(s.slice(4, 6)) - 1;
    const d = Number(s.slice(6, 8));
    return new Date(y, m, d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return s || '—';
}

function showError(message) {
  const el = document.getElementById('error-banner');
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
  document.getElementById('subtitle').textContent = 'Gagal memuat data campaign.';
}

function buildInsights(c, views, paidPct, topCreator, topSharePct) {
  const organicEr = (c['Organic engagement rate'] * 100).toFixed(2);
  const paidEr = (c['Paid engagement rate'] * 100).toFixed(2);
  const sec2 = (c['2-Second video views'] * 100).toFixed(0);
  const sec6 = (c['6-Second video views'] * 100).toFixed(0);

  return `
    <div class="insight"><strong>Paid amplification drives scale</strong>${paidPct}% views dari paid media dengan CPM $${c['CPM'].toFixed(2)} — efisiensi biaya tinggi.</div>
    <div class="insight"><strong>Creator concentration</strong>@${topCreator['Creator name']} kontribusi ${topSharePct}% dari total campaign views — diversifikasi perlu dipertimbangkan.</div>
    <div class="insight warn"><strong>Organic engagement lemah</strong>Organic ER ${organicEr}% vs paid ${paidEr}% — ruang growth organik masih besar.</div>
    <div class="insight warn"><strong>Retention drop setelah hook</strong>${sec2}% pass 2-detik → ${sec6}% di 6-detik — storytelling perlu diperkuat.</div>
  `;
}

function renderDeliverables() {
  const container = document.getElementById('downloads');
  if (!container) return;

  container.innerHTML = DELIVERABLES.map((item) => {
    const cls = item.primary ? 'btn btn-primary' : 'btn';
    return `<a class="${cls}" href="${item.url}" download="${item.filename}">${item.label}</a>`;
  }).join('');
}

function initProductTabs() {
  const tabs = document.querySelectorAll('.product-tab');
  const panels = document.querySelectorAll('.product-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const product = tab.dataset.product;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => {
        p.hidden = p.dataset.product !== product;
      });
    });
  });
}

function pickVideo(videos, compare) {
  if (!videos?.length) return null;
  return videos.reduce((best, v) => (compare(v, best) ? v : best), null);
}

function renderVideoSpotlight(videos) {
  const container = document.getElementById('video-spotlight');
  if (!container) return;

  if (!videos?.length) {
    container.innerHTML = '<p class="spotlight-empty">Tidak ada data video.</p>';
    return;
  }

  const bestOverall = pickVideo(videos, (v, b) => v['Total views'] > b['Total views']);
  const mostShared = pickVideo(videos, (v, b) => v['Shares'] > b['Shares']);
  const retentionPool = videos.filter((v) => v['Total views'] >= 5000);
  const bestRetention = retentionPool.length
    ? pickVideo(retentionPool, (v, b) => v['Video completion rate'] > b['Video completion rate'])
    : null;

  const cards = [
    {
      label: 'Best Overall',
      video: bestOverall,
      metric: bestOverall ? fmt(bestOverall['Total views']) : '—',
      sub: 'Total views',
    },
    {
      label: 'Most Shared',
      video: mostShared,
      metric: mostShared ? fmt(mostShared['Shares']) : '—',
      sub: 'Shares',
    },
    {
      label: 'Best Retention',
      video: bestRetention,
      metric: bestRetention
        ? (bestRetention['Video completion rate'] * 100).toFixed(2) + '%'
        : '—',
      sub: retentionPool.length ? 'Completion rate (≥5K views)' : 'Tidak ada video ≥5K views',
    },
  ];

  container.innerHTML = cards
    .map(({ label, video, metric, sub }) => {
      if (!video) {
        return `
          <div class="spotlight-card">
            <div class="spotlight-label">${label}</div>
            <div class="spotlight-empty">Data tidak tersedia</div>
          </div>`;
      }
      const url = escapeHtml(video['Video URL'] || '#');
      const creator = escapeHtml(video['Creator name']);
      return `
        <div class="spotlight-card">
          <div class="spotlight-label">${label}</div>
          <div class="spotlight-metric">${metric}</div>
          <div class="spotlight-creator">@${creator}</div>
          <div class="metric-label">${sub}</div>
          <a class="spotlight-link" href="${url}" target="_blank" rel="noopener noreferrer">Buka video di TikTok ↗</a>
        </div>`;
    })
    .join('');
}

function drawHorizontalBarChart(canvasId, noteId, items, { barColor = '#158158' } = {}) {
  const canvas = document.getElementById(canvasId);
  const noteEl = noteId ? document.getElementById(noteId) : null;
  if (!canvas) return false;

  if (items === null) {
    if (noteEl) noteEl.textContent = 'Tidak bisa memuat distribusi audiens — format data tidak valid.';
    return false;
  }
  if (!items.length) {
    if (noteEl) noteEl.textContent = 'Data distribusi audiens tidak tersedia.';
    return false;
  }

  if (noteEl) noteEl.textContent = 'Berdasarkan campaign-level audience dari TikTok One export.';

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { t: 8, r: 48, b: 8, l: 72 };
  const rowH = Math.min(28, (h - pad.t - pad.b) / items.length);
  const chartH = rowH * items.length;
  const startY = pad.t + (h - pad.t - pad.b - chartH) / 2;
  const maxPct = Math.max(...items.map((d) => d.pct), 1);
  const barMaxW = w - pad.l - pad.r;

  ctx.clearRect(0, 0, w, h);

  items.forEach((item, i) => {
    const y = startY + i * rowH + rowH * 0.15;
    const barH = rowH * 0.7;
    const barW = (item.pct / maxPct) * barMaxW;

    ctx.fillStyle = '#5f6b64';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, pad.l - 10, y + barH / 2);

    ctx.fillStyle = '#e8f3ed';
    ctx.fillRect(pad.l, y, barMaxW, barH);

    ctx.fillStyle = barColor;
    ctx.fillRect(pad.l, y, barW, barH);

    ctx.fillStyle = '#1a1f1c';
    ctx.textAlign = 'left';
    ctx.fillText(item.pct.toFixed(1) + '%', pad.l + barW + 8, y + barH / 2);
  });

  return true;
}

function renderAudienceCharts(campaign) {
  const ageData = parseDistribution(campaign['Age distribution'], 'age');
  const genderData = parseDistribution(campaign['Gender distribution'], 'gender');

  const redraw = () => {
    drawHorizontalBarChart('ageChart', 'ageChartNote', ageData);
    drawHorizontalBarChart('genderChart', 'genderChartNote', genderData, { barColor: '#2563eb' });
  };

  redraw();
  window.addEventListener('resize', redraw);
}

function drawChart(history) {
  const canvas = document.getElementById('trendChart');
  if (!canvas || !history?.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { t: 12, r: 12, b: 28, l: 44 };
  const max = Math.max(...history.map((d) => d['Total views']));
  const points = history.map((d, i) => ({
    x: pad.l + (i / Math.max(history.length - 1, 1)) * (w - pad.l - pad.r),
    y: pad.t + (1 - d['Total views'] / max) * (h - pad.t - pad.b),
    v: d['Total views'],
    date: String(d.Date).slice(5, 10),
  }));

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#dde5df';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (i / 4) * (h - pad.t - pad.b);
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
    ctx.fillStyle = '#5f6b64';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(max * (1 - i / 4)), pad.l - 8, y + 4);
  }

  ctx.beginPath();
  ctx.strokeStyle = '#158158';
  ctx.lineWidth = 2;
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();

  ctx.fillStyle = '#158158';
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#5f6b64';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  [0, Math.floor(points.length / 2), points.length - 1].forEach((i) => {
    if (points[i]) ctx.fillText(points[i].date, points[i].x, h - 8);
  });
}

export async function initDashboard() {
  initProductTabs();
  renderDeliverables();

  try {
    const res = await fetch('/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data?.campaign) throw new Error('Campaign data tidak ditemukan.');

    const c = data.campaign;
    const m = data.meta || {};
    const views = c['Total views'];
    const paid = c['Paid views'];
    const organic = c['Organic views'];
    const creators = data.creators || [];
    const history = data.history || [];
    const topVideos = data.top_videos || [];

    document.getElementById('subtitle').textContent =
      `${m.brand || 'Campaign'} · ${m.n_creators ?? creators.length} creators · ${m.n_videos ?? '—'} videos · ${m.period || '—'} · Source: ${m.source || '—'}`;

    document.getElementById('kpis').innerHTML = `
      <div class="card"><div class="metric">${fmt(views)}</div><div class="metric-label">Total Views</div></div>
      <div class="card"><div class="metric">${fmt(c['Unique viewers'])}</div><div class="metric-label">Unique Viewers</div></div>
      <div class="card"><div class="metric">${(c['Engagement rate'] * 100).toFixed(2)}%</div><div class="metric-label">Engagement Rate</div></div>
      <div class="card"><div class="metric">$${c['CPM'].toFixed(2)}</div><div class="metric-label">CPM</div></div>
    `;

    renderVideoSpotlight(topVideos);
    renderAudienceCharts(c);

    const paidPct = pct(paid, views);
    document.getElementById('splitBar').innerHTML =
      `<div class="split-paid" style="width:${paidPct}%"></div><div class="split-organic" style="width:${100 - paidPct}%"></div>`;
    document.getElementById('paidLegend').textContent = `Paid ${fmt(paid)} (${paidPct}%)`;
    document.getElementById('organicLegend').textContent = `Organic ${fmt(organic)} (${100 - paidPct}%)`;
    document.getElementById('engRate').textContent = (c['Engagement rate'] * 100).toFixed(2) + '%';
    document.getElementById('cpm').textContent = '$' + c['CPM'].toFixed(2);

    const totalCreatorViews = creators.reduce((s, x) => s + x.total_views, 0);
    const topCreator = creators[0] || { 'Creator name': '—', total_views: 0 };
    const topSharePct = pct(topCreator.total_views, views);

    document.getElementById('creatorTable').innerHTML = creators
      .map(
        (cr) => `
        <tr>
          <td class="creator-name">@${cr['Creator name']}</td>
          <td>${cr.videos}</td>
          <td>${fmt(cr.total_views)}</td>
          <td>${pct(cr.total_views, views)}%</td>
        </tr>
      `
      )
      .join('');

    document.getElementById('insights').innerHTML = buildInsights(
      c,
      views,
      paidPct,
      topCreator,
      topSharePct
    );

    if (history.length) {
      drawChart(history);
      window.addEventListener('resize', () => drawChart(history));
    }

    const viewGap = views - totalCreatorViews;
    let footnote = `Data dari TikTok One export · Diperbarui ${formatReportDate(c['Report updated date'])} · Campaign ID ${c['Campaign or link ID']}`;
    if (viewGap > 0) {
      footnote += ` · Catatan: total views campaign (${fmt(views)}) lebih tinggi dari agregasi video (${fmt(totalCreatorViews)}) — share creator dihitung dari campaign total.`;
    }
    document.getElementById('footnote').textContent = footnote;
  } catch (err) {
    console.error(err);
    showError('Tidak bisa memuat data campaign. Coba refresh halaman atau hubungi admin.');
  }
}
