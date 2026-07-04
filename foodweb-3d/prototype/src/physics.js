/*
 * L1b 物理层 / Physics layer — 真实强迫的 1D 水库物理
 * Real-forcing 1D reservoir physics for Three Gorges Reservoir.
 *
 * 强迫为真实/公开数据：三峡水位调度曲线 + 长江中游水温气候态（见 data.physics）。
 * 输出逐月：水位、水温、分层指数、消落带再淹没补给脉冲、产卵信号就绪度、调度洪峰。
 * 产卵信号 = 水温跨越 18℃（自然线索）× 调度洪峰（工程线索）的重叠 —— 增温使二者解耦。
 *
 * Works in the browser (window.FoodwebPhysics) and in Node.
 */
(function (root) {
  'use strict';

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  // linear interpolation of a 12-month climatology at fractional month t
  function climo(arr, tMonth, delta) {
    const m = ((tMonth % 12) + 12) % 12;
    const i = Math.floor(m), f = m - i;
    const v = arr[i] * (1 - f) + arr[(i + 1) % 12] * f;
    return v + (delta || 0);
  }

  // month (fractional) at which spring temperature first crosses the spawning threshold
  function tempCrossMonth(P, delta) {
    const thr = P.spawnTempThreshold_c;
    for (let m = 0; m <= 7; m += 0.05) {
      if (climo(P.temp_c, m, delta) >= thr) return m;
    }
    return 4; // fallback
  }

  // Build per-month physics series for a scenario.
  function series(data, scen) {
    const P = data.physics;
    const months = data.meta.months;
    const tempDelta = (scen && scen.tempDelta) || 0;
    const stratBoost = (scen && scen.stratBoost) || 0;
    const dispatchOn = !!(scen && scen.dispatch);
    const adaptive = !!(scen && scen.adaptiveDispatch);
    const thr = P.spawnTempThreshold_c;
    const dispatchPeak = P.dispatchPeakMonth;   // 1-based (5 = May)
    const stratMonths = P.coupling.stratSummerMonths;

    // biological spawning readiness is a PULSE centered on the 18°C crossing;
    // warming advances this crossing → it drifts away from the fixed May dispatch.
    // Adaptive dispatch tracks the crossing (releases the flood when fish are ready).
    const bioPeak = tempCrossMonth(P, tempDelta);          // 0-based fractional month
    const dispatchPeak0 = adaptive ? bioPeak : (dispatchPeak - 1);

    const out = [];
    for (let t = 0; t <= months; t++) {
      const temp = climo(P.temp_c, t, tempDelta);
      const wl = climo(P.waterLevel_m, t);
      const dWL = wl - climo(P.waterLevel_m, t - 1);
      const moY = ((t % 12) + 12) % 12;

      // summer thermal stratification (0..1)
      let strat = 0;
      stratMonths.forEach(sm => { strat = Math.max(strat, gauss(moY, sm, 1.4)); });
      strat = clamp01(strat + (moY >= 5 && moY <= 8 ? stratBoost : 0));

      // drawdown-zone re-inundation subsidy: pulse when water level rises after the
      // summer low (re-floods the exposed 消落带, releasing organic matter/nutrients)
      const drawdownPulse = clamp01(dWL / 8) * clamp01((175 - wl) / 25);

      // biological readiness pulse (spring, at the temperature crossing)
      const bioReady = gauss(moY, bioPeak, 1.0);
      // spring water-rise flood: the reservoir DRAWS DOWN in spring (dWL<0), so the
      // natural spring flood cue is nearly absent — ecological dispatch restores it.
      const naturalRise = clamp01(dWL / 5) * gauss(moY, 4, 2.2);
      const dispatchPulse = dispatchOn ? gauss(moY, dispatchPeak0, 0.9) : 0;
      const tempReady = 1 / (1 + Math.exp(-(temp - thr) * 1.2));

      out.push({ t, temp, wl, dWL, strat, drawdownPulse, tempReady, bioReady, naturalRise, dispatchPulse });
    }
    return out;
  }

  function gauss(x, mu, s) { const d = x - mu; return Math.exp(-(d * d) / (2 * s * s)); }

  // recruitment for the four major carps: biological readiness pulse × available spring
  // flood (engineered dispatch, or the near-absent natural spring rise in the reservoir).
  function recruitment(phys, dispatchOn) {
    const flood = dispatchOn ? Math.max(phys.dispatchPulse, phys.naturalRise) : phys.naturalRise;
    return phys.bioReady * flood;
  }

  const api = { series, recruitment, climo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FoodwebPhysics = api;
})(typeof window !== 'undefined' ? window : this);
