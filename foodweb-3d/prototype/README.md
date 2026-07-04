# 食物网 3D 交互模拟原型 / Food-Web 3D Interactive Simulation Prototype

> 阶段 1 原型：把 [`../06-framework-design.md`](../06-framework-design.md) 的 **L1 引擎 → L2 交换格式 → L3 渲染** 三层用一个**自包含 Web 应用**打通，演示"填补可视化空白"（见 [`../02-visualization-3d.md`](../02-visualization-3d.md) §3）。
>
> **⚠️ 演示级模型 + 合成/示意数据**（量级参照文献，非实测）。目的是演示**架构与交互**，非科研级预测。

---

## 运行 / Run

**方式 A — 单文件（零配置，推荐预览）**
直接用浏览器打开 `index.artifact.html`。所有依赖（three.js、数据、代码）已内联，无需联网、无需服务器，也可作为 Claude Artifact 渲染。

**方式 B — 分文件（开发）**
直接双击 `index.html` 即可（数据经 `data/data.js` 全局注入，不用 `fetch`，故 `file://` 亦可运行）。若浏览器仍拦截本地脚本，起个本地服务器：
```bash
cd foodweb-3d/prototype
python3 -m http.server 8000   # 然后访问 http://localhost:8000/
```

## 交互 / Interaction

- **拖动** 旋转 · **滚轮** 缩放 · **右键** 平移（three.js OrbitControls）
- **6 个管理情景** 按钮：基线 / 十年禁渔 / 增殖放流 / 生态调度 / 气候增温 / 外来种入侵
- **时间轴** 滑块 + 播放（120 个月 = 10 年）
- **显示开关**：能量粒子流 · 跨-patch 补给弧（meta-生态系统）· 不确定性壳层(±CV) · 节点标签
- **实时读数**：控制机制（上行/下行/蜂腰）指数条 + 网络指标（总通量 TST、连接度、传递效率、总生物量）

## 视觉编码 / Visual encoding

| 元素 | 含义 |
|---|---|
| **y 轴（高度）** | 营养级 TL（Network3D 思想，见 02） |
| **x 轴（左右）** | 三 patch 纵向梯度：上游河段 → 三峡库区 → 通江湖泊 |
| **球体** | 功能组，大小 ∝ 生物量（随时间/情景变化），颜色 = 类群 |
| **灰色边** | 营养流（捕食），粗细/不透明度 ∝ 通量 |
| **蓝色粒子** | 能量沿边由**猎物 → 捕食者**向上流动（Pawluczuk 2023 思想，见 02） |
| **橙色弧** | 跨-patch 补给流：纵向漂流 / 仔稚鱼漂流 / 产卵洄游 / 消落带补给（meta-生态系统层，见 04 §4） |
| **半透明壳层** | 生物量不确定性 ±CV（见 05 §1） |

## 架构对应 / Architecture (maps to `06-framework-design.md`)

| 文件 | 层 | 职责 |
|---|---|---|
| `data/foodweb-yangtze.json` | **L2 交换格式** | 模型无关 schema 实例：`groups`、`diet`、`inter_edges`（跨-patch 补给）、`scenarios`，**`physics`（三峡水位调度曲线+水温气候态，真实/公开强迫）+ `provenance`（数据来源与诚实边界）** |
| `data/data.js` | — | 由上面 JSON **生成**（`window.FOODWEB_DATA=…`），供 `file://` 直接加载 |
| `src/physics.js` | **L1b 物理层** | 真实强迫的降阶 1D 水库物理（三峡）：水位、水温、分层、消落带再淹没脉冲、产卵就绪脉冲、调度洪峰。浏览器/Node 双运行 |
| `src/engine.js` | **L1 引擎** | 生物量动态积分器（GLV，t0 质量平衡）+ **物理↔营养双向耦合**（温度→光合、水位→消落带补给、信号×调度→家鱼补充、浮游植物→透明度反馈）。纯 JS，亦可 Node 运行 |
| `src/render.js` | **L3 渲染** | three.js/WebGL 场景：节点/边/粒子/补给弧/不确定性/营养级网格 |
| `src/ui.js` | — | DOM ↔ 引擎/渲染 接线：情景、时间、开关、读数 |
| `index.html` | — | 组装（分文件版） |
| `index.artifact.html` | — | 内联单文件（构建产物） |
| `vendor/` | — | three.js r128 UMD + OrbitControls（经 npm registry 取得并入库，离线可用） |
| `data/l2-schema.json` | L2 | 交换格式 JSON Schema（Draft-07），数据已校验通过 |
| `adapters/rpath-adapter.js` | 互操作 | L2 ↔ **Rpath**（Ecopath）原生 CSV，双向 |
| `adapters/mizer-adapter.js` | 互操作 | L2 ↔ **mizer**（体型谱）原生输入，双向 |
| `adapters/roundtrip-test.js` | 互操作 | 往返一致性测试（`node adapters/roundtrip-test.js`，全通过）；输出原生文件到 `adapters/out/`。详见 [`../13-L2-interchange-spec.md`](../13-L2-interchange-spec.md) |

## 6 情景说明 / Scenarios

| 情景 | 参数化 | 预期读数变化 |
|---|---|---|
| **基线** | 现状捕捞 | 稳态 |
| **十年禁渔** | 捕捞死亡率 F→0 | 大型鱼/捕食者回升，下行控制↑、传递效率↑，向下级联（浮游动物受压） |
| **增殖放流** | 持续注入鲢鳙 | 鲢鳙小幅上升，**总生物量近乎不变**（容量约束/间接负效应） |
| **生态调度** | 春季洪峰→四大家鱼补充脉冲 | 四大家鱼↑，总生物量↑ |
| **气候增温** | 物候前移，产卵信号与固定调度**错配** | 调度增益被**抵消**（信号-调度解耦）；浮游机制转换 |
| **外来种入侵** | 银鱼与浮游动物/鲢竞争 | 浮游动物/鲢↓，传递效率↓，网络脆弱化 |

## 物理耦合 / Physics coupling（阶段 2，详见 [`../09-phase2-coupling.md`](../09-phase2-coupling.md)）

右侧**物理耦合面板**（三峡库区）显示：**水库剖面**（水位随月升降、消落带裸露、夏季温跃层、水体按叶绿素 a 染绿）+ **四条时序**（水位/水温/叶绿素 a/**家鱼补充**）带播放头。3D 场景另有微弱物理提示（背景随水温冷暖、家鱼节点补充脉冲发光、消落带补给弧随再淹没增亮，可开关）。

- **真实/公开强迫**：三峡水位调度曲线（175/145 m）+ 长江中游水温气候态（~11–28℃）。
- **双向耦合**：温度→光合（涌现藻华）；浮游植物→透明度→自遮光（**鲢/鳙滤食抑藻=非经典生物操纵**闭环）；水位消落→消落带补给；产卵信号（≥18℃ 脉冲）×调度洪峰→家鱼补充。
- **涌现式解耦**：库区春季消落压制自然补充（基线补充≈0）；生态调度 5 月洪峰恢复补充（峰值 0.64）；**增温 +3℃ 使 18℃ 跨越提前、与固定 5 月调度错位 → 补充降至 0.41（−36%）** —— 非硬编码，而是温度气候态+固定调度共同产生。留意"家鱼补充"读数：它是解耦的直接诊断，而总生物量因增温提升生产力反而偏高。

## 与论文线 2 的关系 / Relation to publication line 2

本原型是 [`../07-roadmap.md`](../07-roadmap.md) **论文线 2（方法+软件 → *MEE* / *Ecological Modelling*）** 的工具雏形：一个开源、3D 交互、时空+情景、不确定性感知的框架。阶段 2 将把 `engine.js` 换为真实耦合模型（Ecopath/Ecosim + GLM-AED/CE-QUAL-W2），把合成数据换为长江实测，并把 L2 交换格式规范化。

## 开发与测试 / Develop &amp; test

```bash
npm install          # ajv（Schema 校验），来自 registry.npmjs.org
npm test             # 引擎稳定性 + Schema + 适配器往返 + 理论模块（tests/run.js）
npm run roundtrip    # 适配器一致性 + 生成原生引擎文件
npm run phase-diagram
```
CI：`.github/workflows/ci.yml`（Node 18/20/22 矩阵，作为独立仓库骨架）。贡献指南见 [CONTRIBUTING.md](CONTRIBUTING.md)。

**提取为独立仓库**（论文线 2 §T5）：本机运行 `bash scripts/extract-standalone-repo.sh [名称] [--private|--public]`——subtree split 保留历史 + `gh` 建仓 + 推送 + 打 v0.3.0（自包含 README 见 `scripts/README-standalone.md`）。须本机跑：本会话 GitHub 集成无建仓权限。

## 引用与许可 / Cite &amp; license

- 许可：**MIT**（[LICENSE](LICENSE)；vendored three.js 亦 MIT）。
- 引用：见 [CITATION.cff](CITATION.cff)。
- 作为论文线 2（方法+软件）的可引用软件工件，规范见 [`../13-L2-interchange-spec.md`](../13-L2-interchange-spec.md)。

## 局限 / Caveats

- 动态为**演示级** GLV press-perturbation，非校准的 Ecosim；数值经调参以产生可读的、方向正确的情景差异。
- 数据为**合成/示意**，功能组/营养级/生物量量级参照文献但非某一实测水体。
- 三 patch 为**示意拓扑**；真实实现需按目标水体的河-库-湖连通与消落带定义空间流。
- 控制机制指数（上行/下行/蜂腰）为**归一化示意代理**，非严格的能流分解。
