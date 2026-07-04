/*
 * UI 层 / Controls + live readouts
 * 时间滑块+播放、7 情景开关、控制机制/网络指标读数、图例、不确定性/粒子/补给开关。
 * Wires the DOM to the engine (L1) and renderer (L3).
 */
(function () {
  'use strict';

  function boot(data) {
    const model = window.FoodwebEngine.buildModel(data);
    const container = document.getElementById('scene');
    const viz = window.FoodwebRender.init(container, data, window.THREE);

    // precompute all scenario simulations
    const results = {};
    data.scenarios.forEach(s => { results[s.id] = window.FoodwebEngine.simulate(model, s.id); });

    let currentScen = 'baseline';
    viz.loadScenario(results[currentScen]);

    // physics anchor label
    if (data.physics) document.getElementById('phys-anchor').textContent = '· ' + data.physics.anchor_zh;
    const physCanvas = document.getElementById('physcanvas');

    // ----- scenario buttons -----
    const scenWrap = document.getElementById('scenarios');
    data.scenarios.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'scen-btn' + (s.id === currentScen ? ' active' : '');
      btn.textContent = s.name_zh;
      btn.title = s.desc_zh;
      btn.onclick = () => {
        currentScen = s.id;
        document.querySelectorAll('.scen-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        viz.loadScenario(results[s.id]);
        document.getElementById('scen-desc').textContent = s.name_zh + ' — ' + s.desc_zh;
        refreshMetrics();
      };
      scenWrap.appendChild(btn);
    });
    document.getElementById('scen-desc').textContent = '基线 — ' + data.scenarios[0].desc_zh;

    // ----- time slider + play -----
    const slider = document.getElementById('month');
    slider.max = viz.frameCount - 1;
    const monthLabel = document.getElementById('month-label');
    slider.oninput = () => { viz.playing = false; viz.setMonth(parseInt(slider.value, 10)); };
    viz.onMonth = (m) => {
      slider.value = Math.round(m);
      const yr = (m / 12);
      monthLabel.textContent = '第 ' + Math.round(m) + ' 月 / Year ' + yr.toFixed(1);
      refreshMetrics();
    };

    const playBtn = document.getElementById('play');
    playBtn.onclick = () => {
      if (viz.month >= viz.frameCount - 1) viz.month = 0;
      viz.playing = !viz.playing;
      playBtn.textContent = viz.playing ? '⏸ 暂停' : '▶ 播放';
    };
    viz._playBtn = playBtn;
    // reflect auto-stop
    setInterval(() => { playBtn.textContent = viz.playing ? '⏸ 暂停' : '▶ 播放'; }, 300);

    // ----- toggles -----
    bindToggle('t-uncertainty', v => { viz.opts.uncertainty = v; viz.setMonth(viz.month); });
    bindToggle('t-inter', v => { viz.opts.interEdges = v; viz.setMonth(viz.month); });
    bindToggle('t-particles', v => { viz.opts.particles = v; });
    bindToggle('t-phys', v => { viz.opts.phys = v; viz.setMonth(viz.month); });
    bindToggle('t-labels', v => { viz.opts.labels = v; viz.setMonth(viz.month); });

    function bindToggle(id, fn) {
      const el = document.getElementById(id);
      el.onchange = () => fn(el.checked);
      fn(el.checked);
    }

    // ----- metrics readout (function declaration = hoisted, safe to call early) -----
    function refreshMetrics() {
      if (!viz.frames) return;
      const m = viz.currentFrame().metrics;
      // normalize the three control indices to sum-relative for display
      const sum = m.bottomUp + m.topDown + m.waspWaist || 1;
      document.getElementById('bar-bu').style.width = (100 * m.bottomUp / sum) + '%';
      document.getElementById('bar-td').style.width = (100 * m.topDown / sum) + '%';
      document.getElementById('bar-ww').style.width = (100 * m.waspWaist / sum) + '%';
      document.getElementById('m-tst').textContent = m.tst.toFixed(1);
      document.getElementById('m-conn').textContent = m.connectance.toFixed(3);
      document.getElementById('m-te').textContent = m.transferEff.toFixed(3);
      document.getElementById('m-tot').textContent = m.totalBiomass.toFixed(1);
      drawPhysics();
    }

    // ----- physics panel: reservoir cross-section + time series -----
    function drawPhysics() {
      if (!data.physics) return;
      const frames = results[currentScen].frames;
      const mi = Math.round(viz.month);
      const fr = frames[Math.min(mi, frames.length - 1)];
      if (!fr || !fr.phys) return;
      const ctx = physCanvas.getContext('2d');
      const W = physCanvas.width, H = physCanvas.height;
      ctx.clearRect(0, 0, W, H);

      // --- top: reservoir cross-section (0..96) ---
      const secH = 96, pad = 6;
      const WLmin = 145, WLmax = 176;
      const basinTop = 12, basinBot = secH - 14;
      const damX = W - 22;
      const wlY = v => basinBot - (v - WLmin) / (WLmax - WLmin) * (basinBot - basinTop);
      // basin walls
      ctx.strokeStyle = '#3a5561'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad, basinTop); ctx.lineTo(pad + 18, basinBot); ctx.lineTo(damX, basinBot);
      ctx.lineTo(damX, basinTop); ctx.stroke();
      // fluctuation zone (145..175) faint
      ctx.fillStyle = 'rgba(180,120,70,0.10)';
      ctx.fillRect(pad + 18, wlY(WLmax), damX - pad - 18, wlY(WLmin) - wlY(WLmax));
      // water body, tinted by chl-a (greener when eutrophic)
      const chl = fr.phys.chlA, green = Math.min(chl / 45, 1);
      const surfY = wlY(fr.phys.wl);
      const grad = ctx.createLinearGradient(0, surfY, 0, basinBot);
      grad.addColorStop(0, 'rgba(' + (30 + green * 90) + ',' + (150 + green * 60) + ',' + (200 - green * 70) + ',0.85)');
      grad.addColorStop(1, 'rgba(10,40,70,0.9)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(pad + (surfY <= basinBot ? (basinBot - surfY) / (basinBot - basinTop) * 18 : 18), surfY);
      ctx.lineTo(damX, surfY); ctx.lineTo(damX, basinBot); ctx.lineTo(pad + 18, basinBot); ctx.closePath(); ctx.fill();
      // drawdown exposed band (above surface, within fluctuation zone)
      if (fr.phys.wl < WLmax - 1) {
        ctx.fillStyle = 'rgba(180,120,70,0.35)';
        ctx.fillRect(pad + 18, wlY(WLmax), damX - pad - 18, surfY - wlY(WLmax));
      }
      // thermocline in summer
      if (fr.phys.strat > 0.4) {
        const thY = surfY + (basinBot - surfY) * 0.42;
        ctx.strokeStyle = 'rgba(255,200,80,' + (0.3 + fr.phys.strat * 0.5) + ')'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(pad + 18, thY); ctx.lineTo(damX, thY); ctx.stroke(); ctx.setLineDash([]);
      }
      // dam
      ctx.fillStyle = '#59707a'; ctx.fillRect(damX, basinTop - 2, 8, basinBot - basinTop + 4);
      // labels
      ctx.fillStyle = '#9fb8c0'; ctx.font = '9px sans-serif'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('175', damX - 20, wlY(175) - 1); ctx.fillText('145', damX - 20, wlY(145) - 1);
      ctx.fillStyle = '#e8f1f2'; ctx.font = '10px sans-serif';
      ctx.fillText('水位 ' + fr.phys.wl.toFixed(0) + ' m', pad + 20, basinTop + 9);
      ctx.fillText('水温 ' + fr.phys.temp.toFixed(1) + '℃', pad + 20, basinTop + 21);

      // --- bottom: time-series sparklines (96..188) ---
      const traces = [
        { key: 'wl', lo: 144, hi: 176, col: '#38bec9', name: '水位' },
        { key: 'temp', lo: 8, hi: 31, col: '#ff9f40', name: '水温' },
        { key: 'chlA', lo: 10, hi: 45, col: '#66bb6a', name: '叶绿素a' },
        { key: 'recruitment', lo: 0, hi: 0.7, col: '#e15b97', name: '家鱼补充' }
      ];
      const rowH = (H - secH - 4) / traces.length;
      traces.forEach((tr, ti) => {
        const y0 = secH + 4 + ti * rowH, y1 = y0 + rowH - 3;
        ctx.strokeStyle = tr.col; ctx.lineWidth = 1; ctx.beginPath();
        frames.forEach((f, k) => {
          const v = f.phys ? f.phys[tr.key] : 0;
          const x = pad + (k / (frames.length - 1)) * (W - pad * 2);
          const yy = y1 - ((v - tr.lo) / (tr.hi - tr.lo)) * (rowH - 4);
          k === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
        });
        ctx.stroke();
        ctx.fillStyle = tr.col; ctx.font = '8px sans-serif';
        ctx.fillText(tr.name, pad + 1, y0 + 7);
      });
      // playhead
      const phx = pad + (mi / (frames.length - 1)) * (W - pad * 2);
      ctx.strokeStyle = 'rgba(230,241,242,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(phx, secH + 2); ctx.lineTo(phx, H); ctx.stroke();

      // readout line
      document.getElementById('phys-readout').innerHTML =
        '叶绿素a <b style="color:#66bb6a">' + fr.phys.chlA.toFixed(1) + '</b> · 透明度 <b>' + fr.phys.clarity.toFixed(2) +
        '</b> · 家鱼补充 <b style="color:#e15b97">' + fr.phys.recruitment.toFixed(2) + '</b>';
    }

    // ----- legend -----
    const legend = document.getElementById('legend');
    const seen = {};
    data.groups.forEach(g => {
      if (seen[g.type]) return; seen[g.type] = 1;
      const c = window.FoodwebRender.TYPE_COLOR[g.type] || 0x999999;
      const item = document.createElement('span');
      item.className = 'legend-item';
      item.innerHTML = '<i style="background:#' + c.toString(16).padStart(6, '0') + '"></i>' + typeLabel(g.type);
      legend.appendChild(item);
    });

    refreshMetrics();
    viz.setMonth(0);
  }

  function typeLabel(t) {
    return ({ detritus: '碎屑', producer: '生产者', consumer: '初级消费者', planktivore: '浮游食性鱼',
      herbivore: '草食鱼', omnivore: '杂食鱼', predator: '肉食鱼', apex: '顶级捕食者' })[t] || t;
  }

  window.FoodwebUI = { boot: boot };
})();
