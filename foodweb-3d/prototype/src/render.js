/*
 * L3 渲染层 / Renderer — three.js/WebGL
 * 营养级 y 轴 (Network3D 思想) × 加权有向流 + 沿边能量粒子 (Pawluczuk 2023 思想)
 * × 三-patch 空间底图 (meta-生态系统) × 不确定性壳层 × 跨 patch 补给弧。
 * Consumes the L2 data + an engine simulation result; positions are fixed,
 * only sizes / edge widths / particle speeds update per month.
 *
 * Exposes window.FoodwebRender.init(container, data, THREE) -> viz
 */
(function (root) {
  'use strict';

  const TYPE_COLOR = {
    detritus:   0x8d6e63,
    producer:   0x66bb6a,
    consumer:   0x26c6da,
    planktivore:0x42a5f5,
    herbivore:  0x9ccc65,
    omnivore:   0xffca28,
    predator:   0xef5350,
    apex:       0xab47bc
  };
  const PX = 30;   // longitudinal spacing between patches
  const TY = 9;    // vertical spacing per trophic level
  const Z = 22;    // depth spread within a patch

  function init(container, data, THREE) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06121a);
    scene.fog = new THREE.Fog(0x06121a, 120, 260);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(46, 34, 70);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 13, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(30, 60, 40);
    scene.add(dir);

    // ---- layout: fixed node positions -------------------------------------
    const patchX = {};
    data.patches.forEach(p => { patchX[p.id] = p.x * PX; });
    const idx = {}; data.groups.forEach((g, i) => { idx[g.id] = i; });

    // spread nodes within each patch on the z-axis so equal-TL nodes don't overlap
    const byPatch = {};
    data.groups.forEach((g, i) => { (byPatch[g.patch] = byPatch[g.patch] || []).push(i); });
    const pos = new Array(data.groups.length);
    Object.keys(byPatch).forEach(pid => {
      const arr = byPatch[pid].slice().sort((a, b) => data.groups[a].tl - data.groups[b].tl);
      arr.forEach((gi, k) => {
        const g = data.groups[gi];
        const spread = (k - (arr.length - 1) / 2) / Math.max(arr.length - 1, 1);
        pos[gi] = new THREE.Vector3(
          patchX[pid],
          (g.tl - 1) * TY,
          spread * Z
        );
      });
    });

    // ---- trophic-level reference grid + labels ----------------------------
    const gridGroup = new THREE.Group();
    for (let tl = 1; tl <= 4; tl++) {
      const y = (tl - 1) * TY;
      const g = new THREE.PlaneGeometry(PX * 2.6, Z * 1.5);
      const m = new THREE.MeshBasicMaterial({ color: 0x2f8aa0, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(g, m);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(0, y, 0);
      gridGroup.add(plane);
      gridGroup.add(makeLabel(THREE, 'TL ' + tl, new THREE.Vector3(-PX * 1.4, y, -Z * 0.8), 0x7d9aa3, 22));
    }
    scene.add(gridGroup);

    // ---- patch labels ------------------------------------------------------
    data.patches.forEach(p => {
      scene.add(makeLabel(THREE, p.name_zh, new THREE.Vector3(p.x * PX, 34, 0), 0x38bec9, 30));
    });

    // ---- nodes -------------------------------------------------------------
    const nodeMeshes = [], shellMeshes = [], nodeLabels = [];
    const sphereGeo = new THREE.SphereGeometry(1, 20, 16);
    data.groups.forEach((g, i) => {
      const color = TYPE_COLOR[g.type] || 0x999999;
      const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.1, emissive: color, emissiveIntensity: 0.15 });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.copy(pos[i]);
      scene.add(mesh);
      nodeMeshes.push(mesh);

      const shellMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.13, side: THREE.BackSide });
      const shell = new THREE.Mesh(sphereGeo, shellMat);
      shell.position.copy(pos[i]);
      shell.visible = false;
      scene.add(shell);
      shellMeshes.push(shell);

      const label = makeLabel(THREE, g.name_zh, pos[i].clone(), 0xe6edf3, 24);
      scene.add(label);
      nodeLabels.push(label);
    });

    // ---- intra-patch trophic edges (cylinders) + particles ----------------
    const edges = [];            // {pred, prey, mesh, dir, len, mid}
    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
    const upY = new THREE.Vector3(0, 1, 0);
    data.groups.forEach((g, pi) => {
      const d = data.diet[g.id]; if (!d) return;
      Object.keys(d).forEach(preyId => {
        const pj = idx[preyId]; if (pj == null) return;
        const a = pos[pj], b = pos[pi];   // energy flows prey(a) -> predator(b)
        const dirv = new THREE.Vector3().subVectors(b, a);
        const len = dirv.length();
        const mat = new THREE.MeshBasicMaterial({ color: 0x4b5563, transparent: true, opacity: 0.5 });
        const mesh = new THREE.Mesh(cylGeo, mat);
        mesh.position.copy(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5));
        mesh.quaternion.setFromUnitVectors(upY, dirv.clone().normalize());
        mesh.scale.set(0.12, len, 0.12);
        scene.add(mesh);
        edges.push({ pred: pi, prey: pj, mesh: mesh, a: a.clone(), b: b.clone(), len: len });
      });
    });

    // particle system flowing prey -> predator (upward energy)
    const PPE = 2; // particles per edge
    const pCount = edges.length * PPE;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const pPhase = new Float32Array(pCount);
    const pEdge = new Int32Array(pCount);
    for (let e = 0; e < edges.length; e++) {
      for (let k = 0; k < PPE; k++) {
        const p = e * PPE + k;
        pEdge[p] = e;
        pPhase[p] = (k / PPE + (e * 0.37)) % 1;
      }
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({ size: 1.3, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // ---- inter-patch subsidy arcs (meta-ecosystem) ------------------------
    const interGroup = new THREE.Group();
    const interArcs = [];
    (data.inter_edges || []).forEach(ie => {
      const gi = idx[ie.group]; if (gi == null) return;
      const from = new THREE.Vector3(patchX[ie.source_patch], (data.groups[gi].tl - 1) * TY + 2, Z * 0.9);
      const to = new THREE.Vector3(patchX[ie.target_patch], (data.groups[gi].tl - 1) * TY + 2, Z * 0.9);
      const midp = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      midp.y += 10 + Math.abs(to.x - from.x) * 0.12;
      const curve = new THREE.QuadraticBezierCurve3(from, midp, to);
      const geo = new THREE.TubeGeometry(curve, 24, 0.35, 6, false);
      const mat = new THREE.MeshBasicMaterial({ color: 0xf0a020, transparent: true, opacity: 0.55 });
      const mesh = new THREE.Mesh(geo, mat);
      interGroup.add(mesh);
      interGroup.add(makeLabel(THREE, ie.type_zh, midp.clone(), 0xf0a020, 18));
      interArcs.push(mesh);
    });
    scene.add(interGroup);

    // ---- per-frame state ---------------------------------------------------
    const viz = {
      frames: null, frameCount: 0, month: 0, playing: false, speed: 0.6,
      opts: { uncertainty: false, interEdges: true, particles: true, labels: true },
      _maxFlux: 1, _t: 0, onMonth: null
    };

    viz.loadScenario = function (result) {
      viz.frames = result.frames;
      viz.frameCount = result.frames.length;
      let mx = 0;
      result.frames.forEach(f => f.flux.forEach(x => { if (x > mx) mx = x; }));
      viz._maxFlux = mx || 1;
      viz.setMonth(Math.min(viz.month, viz.frameCount - 1));
    };

    viz.setMonth = function (m) {
      viz.month = Math.max(0, Math.min(m, viz.frameCount - 1));
      applyFrame();
      if (viz.onMonth) viz.onMonth(viz.month);
    };

    function currentFrame() {
      const m = Math.round(viz.month);
      return viz.frames[Math.max(0, Math.min(m, viz.frameCount - 1))];
    }

    function applyFrame() {
      if (!viz.frames) return;
      const fr = currentFrame();
      // nodes
      data.groups.forEach((g, i) => {
        const B = fr.B[i];
        const r = 0.9 + Math.cbrt(B) * 0.85;
        nodeMeshes[i].scale.setScalar(r);
        const shell = shellMeshes[i];
        shell.visible = viz.opts.uncertainty;
        shell.scale.setScalar(r * (1 + (g.cv || 0.3)));
        nodeLabels[i].visible = viz.opts.labels;
        nodeLabels[i].position.set(nodeMeshes[i].position.x, nodeMeshes[i].position.y + r + 2.4, nodeMeshes[i].position.z);
      });
      // edges thickness by flux
      edges.forEach((e, ei) => {
        const f = fr.flux[ei] || 0;
        const w = 0.05 + (f / viz._maxFlux) * 0.9;
        e.mesh.scale.set(w, e.len, w);
        e.mesh.material.opacity = 0.25 + 0.5 * (f / viz._maxFlux);
      });
      interGroup.visible = viz.opts.interEdges;
      points.visible = viz.opts.particles;
    }

    function updateParticles(dt) {
      if (!viz.frames || !viz.opts.particles) return;
      const fr = currentFrame();
      const posArr = pGeo.attributes.position.array;
      const colArr = pGeo.attributes.color.array;
      for (let p = 0; p < pCount; p++) {
        const e = edges[pEdge[p]];
        const f = fr.flux[pEdge[p]] || 0;
        const rel = f / viz._maxFlux;
        pPhase[p] = (pPhase[p] + dt * (0.15 + rel * 0.9) * viz.speed) % 1;
        const t = pPhase[p];
        posArr[p * 3]     = e.a.x + (e.b.x - e.a.x) * t;
        posArr[p * 3 + 1] = e.a.y + (e.b.y - e.a.y) * t;
        posArr[p * 3 + 2] = e.a.z + (e.b.z - e.a.z) * t;
        const c = 0.3 + 0.7 * rel;
        colArr[p * 3] = c; colArr[p * 3 + 1] = 0.9 * c + 0.1; colArr[p * 3 + 2] = 0.4 + 0.6 * (1 - rel);
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.color.needsUpdate = true;
    }

    let last = 0;
    function animate(ts) {
      const dt = last ? Math.min((ts - last) / 1000, 0.06) : 0.016;
      last = ts;
      if (viz.playing && viz.frames) {
        viz.month += dt * 6 * viz.speed; // ~6 months/sec at speed 1
        if (viz.month >= viz.frameCount - 1) { viz.month = viz.frameCount - 1; viz.playing = false; }
        applyFrame();
        if (viz.onMonth) viz.onMonth(viz.month);
      }
      updateParticles(dt);
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    viz.resize = function () {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', viz.resize);

    viz.groups = data.groups;
    viz.currentFrame = currentFrame;
    return viz;
  }

  function makeLabel(THREE, text, position, color, px) {
    const pad = 8;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = (px || 24) + 'px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
    ctx.font = font;
    const w = ctx.measureText(text).width;
    canvas.width = w + pad * 2;
    canvas.height = (px || 24) + pad * 2;
    ctx.font = font;
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pad, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    const scale = 0.05 * (px || 24);
    sprite.scale.set(canvas.width * scale / (px || 24) * 1.0, canvas.height * scale / (px || 24) * 1.0, 1);
    sprite.scale.set(canvas.width / canvas.height * 4.2, 4.2, 1);
    return sprite;
  }

  root.FoodwebRender = { init: init, TYPE_COLOR: TYPE_COLOR };
})(typeof window !== 'undefined' ? window : this);
