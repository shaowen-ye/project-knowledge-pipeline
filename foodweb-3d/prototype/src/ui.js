/*
 * UI 层 / Controls + live readouts
 * 时间滑块+播放、6 情景开关、控制机制/网络指标读数、图例、不确定性/粒子/补给开关。
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
