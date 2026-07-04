# 08 · 参考文献 / References

> 按主题分组，尽量带 DOI。**核实状态**：✅ = 作者/期刊/DOI 已核实；🟡 = 已核实研究/期刊/结论，作者全名或卷页**待定稿前核对**（对应正文 `[待核实作者]`）。定稿投稿前须把所有 🟡 逐条核实并升级为 ✅。

---

## A. 静态 / 物质平衡方法 / Static · mass-balance

- ✅ Christensen V. & Walters C.J. 2004. Ecopath with Ecosim: methods, capabilities and limitations. *Ecological Modelling* 172:109–139. doi:10.1016/j.ecolmodel.2003.09.003
- ✅ Walters C., Christensen V. & Pauly D. 1997. Structuring dynamic models of exploited ecosystems from trophic mass-balance assessments. *Rev. Fish Biol. Fish.* 7:139–172.
- ✅ Lucey S.M., Gaichas S.K. & Aydin K.Y. 2020. Conducting reproducible ecosystem modeling using the R package Rpath. *Ecological Modelling* 427:109057. doi:10.1016/j.ecolmodel.2020.109057
- ✅ van Oevelen D. et al. 2010. Quantifying food web flows using linear inverse models. *Ecosystems* 13:32–45. doi:10.1007/s10021-009-9297-6
- ✅ Borrett S.R. & Lau M.K. 2014. enaR: An R package for ecosystem network analysis. *Methods Ecol. Evol.* 5:1206–1214. doi:10.1111/2041-210X.12282
- ✅ Kazanci C. 2007. EcoNet: A new software for ecological modeling, simulation and network analysis. *Ecological Modelling* 208:3–8. doi:10.1016/j.ecolmodel.2007.04.031
- ✅ Guesnet V. et al. 2015. Incorporating food-web parameter uncertainty into Ecopath-derived ecological network indicators. *Ecological Modelling* 313:29–40.
- 🟡 `ecostate` (Thorson et al.) — 状态空间物质平衡动态模型，CRAN 包（核实首发论文与年份）。
- 🟡 `samplelim` (Girardin, Regnault et al.) — 高维多面体采样用于营养/代谢网络（核实出处）。

## B. 动态 / 机理方法 / Dynamic · mechanistic

- ✅ Fulton E.A. et al. 2011. Lessons in modelling and management of marine ecosystems: the Atlantis experience. *Fish and Fisheries* 12:171–188. doi:10.1111/j.1467-2979.2011.00412.x
- ✅ Audzijonyte A. et al. 2019. Atlantis: A spatially explicit end-to-end marine ecosystem model. *Methods Ecol. Evol.* doi:10.1111/2041-210X.13272
- ✅ Scott F., Blanchard J.L. & Andersen K.H. 2014. mizer: an R package for multispecies, trait-based and community size spectrum modelling. *Methods Ecol. Evol.* 5:1121–1125. doi:10.1111/2041-210X.12256
- ✅ Shin Y.-J. & Cury P. 2004. Using an individual-based model of fish assemblages to study the response of size spectra to changes in fishing (OSMOSE). *Can. J. Fish. Aquat. Sci.* 61:414–431.
- 🟡 Heath M.R. 2012 / StrathE2E2 — 端到端陆架食物网模型；R 包 `StrathE2E2`（核实首发论文卷页）。
- ✅ Hipsey M.R. et al. 2019. A General Lake Model (GLM 3.0) for linking with high-frequency sensor data. *Geoscientific Model Development* 12:473–523. doi:10.5194/gmd-12-473-2019
- 🟡 CE-QUAL-W2 (Cole T.M. & Wells S.A.) — 2D 纵-垂水动力+水质模型（核实手册版本/年份）。
- 🟡 AEM3D / ELCOM-CAEDYM (Hodges B. & Hipsey M.) — 3D 水动力+生化（核实引用出处）。
- 🟡 Yodzis-Innes 生物能量 ODE / ATN (Brose, Williams, Martinez) — 异速营养网络（核实代表文献）。

## C. 数据驱动 / 统计 / ML

- ✅ Stock B.C. et al. 2018. Analyzing mixing systems using a new generation of Bayesian tracer mixing models (MixSIAR). *PeerJ* 6:e5096. doi:10.7717/peerj.5096
- ✅ Sugihara G. et al. 2012. Detecting causality in complex ecosystems (EDM/CCM). *Science* 338:496–500. doi:10.1126/science.1227079
- ✅ Tikhonov G. et al. 2020. Joint species distribution modelling with the R-package Hmsc. *Methods Ecol. Evol.* doi:10.1111/2041-210X.13345
- ✅ Rahman K.A. et al. 2024. Accelerating joint species distribution modelling with Hmsc-HPC. *PLoS Comput. Biol.* doi:10.1371/journal.pcbi.1011914
- ✅ Boyse E. et al. 2025. Inferring species interactions from co-occurrence networks with environmental DNA metabarcoding data in a coastal marine food web. *Molecular Ecology*. doi:10.1111/mec.17701

## D. 可视化 / Visualization

- ✅ Hudson L.N. et al. 2013. Cheddar: analysis and visualisation of ecological communities in R. *Methods Ecol. Evol.* 4:99–104. doi:10.1111/2041-210X.12005
- ✅ Pawluczuk Ł. et al. 2023. Food web visualisation: heatmap, interactive graph and animated flow network. *Methods Ecol. Evol.* doi:10.1111/2041-210X.13839
- 🟡 Yoon I., Williams R., Martinez N. et al. ~2004–2005. Network3D / "Webs on the Web"（营养级 z 轴 3D 食物网；核实确切引用与年份）。
- ✅ Bastian M. et al. 2009. Gephi: an open source software for exploring and manipulating networks. *ICWSM*.
- ✅ Shannon P. et al. 2003. Cytoscape: a software environment for integrated models of biomolecular interaction networks. *Genome Res.* 13:2498–2504.

## E. 管理驱动与应用 / Applications

- ✅ Heymans J.J. et al. 2016. Best practice in Ecopath with Ecosim food-web models for ecosystem-based management. *Ecological Modelling* 331:173–184.
- ✅ Craig J.K. & Link J.S. 2023. It is past time to use ecosystem models tactically to support ecosystem-based fisheries management. *Fish and Fisheries*.
- 🟡 长江口生态网络分析（禁渔后网络恢复）2025 —— 网络复杂度/关键种迁移（核实作者/期刊/卷页）。
- 🟡 赤水河禁渔鱼类资源恢复。*Ecological Processes* 2023, 12（核实作者）。
- 🟡 赣江去捕捞后浮游植物群落重构。*Ecology and Evolution* 2024, PMC11362611（核实作者）。
- 🟡 草海生态系统稳定性。*Water* 2024, 16:782（核实作者）。
- 🟡 引种银鱼 (*Neosalanx taihuensis*) 三水库 Ecopath。*Hydrobiologia* 2020, 847（核实作者）。
- ✅ Rogers T.L. et al. (PNAS) — 物种入侵渐进破坏本土食物网营养结构（核实确切年份/卷页）。🟡 年份待核。
- 🟡 Xiang 等 2025. 喜植物产卵鱼生境模型（三峡生态调度错配）。*Ecology and Evolution* e72166（核实作者名）。
- 🟡 鄱阳湖水位波动与食物网稳定性。*Ecological Indicators* 2023, S1470160X23005149（核实作者）。
- 🟡 三峡水库人工水位波动与底栖鱼营养生态位。*CJFAS* 2024, cjfas-2023-0114（核实作者）。
- ✅ 气候增温 28 年重构水生食物网。*Global Change Biology* 2020（Lake Maggiore；核实作者名 🟡）。
- 🟡 "Lakes in Hot Water". *BioScience* 2022, 72:1050（核实作者）。
- 🟡 亚热带水库生态修复能流质量平衡模型。*Science of the Total Environment* 2019（核实作者）。
- 🟡 非经典生物操纵鲢/鳙抑藻。Xie P. & Liu J. 2001（核实确切出处）。

## F. 营养理论 / Trophic theory

- ✅ Hairston N.G., Smith F.E. & Slobodkin L.B. 1960. Community structure, population control, and competition. *Am. Nat.* 94:421–425.
- 🟡 Oksanen L. et al. 1981. Exploitation ecosystems in gradients of primary productivity. *Am. Nat.* 118:240–261（核实卷页）。
- ✅ Cury P. et al. 2000. Small pelagics in upwelling systems: patterns of interaction and structural changes in "wasp-waist" ecosystems. *ICES J. Mar. Sci.* 57:603–618.
- 🟡 Lynam C.P. et al. 2017. Interaction between top-down and bottom-up control in marine food webs. *PNAS*（核实卷页）。
- ✅ Carpenter S.R., Kitchell J.F. & Hodgson J.R. 1985. Cascading trophic interactions and lake productivity. *BioScience* 35:634–639.
- ✅ Carpenter S.R. & Kitchell J.F. (eds.) 1993. *The Trophic Cascade in Lakes*. Cambridge University Press.
- ✅ Carpenter S.R. et al. 2001. Trophic cascades, nutrients, and lake productivity: whole-lake experiments. *Ecological Monographs* 71:163–186.
- ✅ Pace M.L., Cole J.J., Carpenter S.R. & Kitchell J.F. 1999. Trophic cascades revealed in diverse ecosystems. *Trends Ecol. Evol.* 14:483–488.
- ✅ Shurin J.B. et al. 2002. A cross-ecosystem comparison of the strength of trophic cascades. *Ecology Letters* 5:785–791.
- ✅ Loreau M., Mouquet N. & Holt R.D. 2003. Meta-ecosystems: a theoretical framework for a spatial ecosystem ecology. *Ecology Letters* 6:673–679.
- 🟡 Gravel D., Guichard F., Loreau M. & Mouquet N. 2010. Source and sink dynamics in meta-ecosystems. *Ecology* 91:2172–2184（核实卷页）。
- 🟡 Massol F., Gravel D., Mouquet N. et al. 2011. Linking community and ecosystem dynamics through spatial ecology. *Ecology Letters* 14:313–323（核实卷页）。
- ✅ Gounand I., Harvey E., Little C.J. & Altermatt F. 2018. Meta-ecosystems 2.0: rooting the theory into the field. *Trends Ecol. Evol.* 33:36–46.
- ✅ Gravel D. et al. 2016. Stability and complexity in model meta-ecosystems. *Nature Communications* 7:12457.
- ✅ Polis G.A., Anderson W.B. & Holt R.D. 1997. Toward an integration of landscape and food web ecology. *Annu. Rev. Ecol. Syst.* 28:289–316.
- ✅ Nakano S. & Murakami M. 2001. Reciprocal subsidies: dynamic interdependence between terrestrial and aquatic food webs. *PNAS* 98:166–170.
- 🟡 Lafage D. et al. 2019. Local and landscape drivers of aquatic-to-terrestrial subsidies. *Ecosphere*（核实卷页）。

## G. 前沿 / 结构不确定性 / Frontier

- 🟡 The complex structure of aquatic food webs emerges from a few assembly rules. *Nature Ecology & Evolution* 2025（核实作者/卷页）。
- 🟡 多样性–食物网结构–稳定性. *Science Advances* 2025（核实作者/卷页）。
- ✅ Structural uncertainty in marine food webs. *Global Change Biology* 2025. doi:10.1111/gcb.70143（核实作者名 🟡）。

---

## 核实清单 / Verification TODO（定稿前）

- [ ] 所有 🟡 条目补全作者全名、卷页、DOI。
- [ ] 近年中文/区域案例（长江锚定）逐条对 DOI 核对作者与结论。
- [ ] `ecostate`、`samplelim`、StrathE2E2、CE-QUAL-W2、AEM3D、Network3D 的规范首发引用确认。
- [ ] Rogers et al. PNAS、GCB 2020、NEE 2025、Science Advances 2025 的确切年份/卷页确认。
