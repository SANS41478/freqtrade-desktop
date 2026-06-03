更新日志
changelog
<div class="page-header">
  <span class="badge badge-warning">开发与部署</span>
  <h1 id="changelog">更新日志</h1>
  <p class="page-description">Freqtrade Desktop 的版本更新记录。</p>
</div>

<h2 id="v0-1-0">v0.1.0 <span class="badge badge-primary">最新</span></h2>
<p><em>2026 年 6 月</em></p>

<h3 id="v0-1-0-features">新增功能</h3>
<ul>
  <li>? 实时交易仪表盘 — 余额、持仓、收益实时监控</li>
  <li>? 交易管理 — 完整交易历史、多维筛选、CSV 导出</li>
  <li>? K线图表 — 基于 Lightweight Charts 的专业级K线图</li>
  <li>? 回测中心 — 可视化回测、多策略对比分析</li>
  <li>? 超参数优化 — Optuna 驱动、实时进度追踪</li>
  <li>? 策略管理 — Monaco Editor、Python 语法高亮、模板创建</li>
  <li>? 配置编辑器 — 可视化表单、实时验证、导入导出</li>
  <li>? 数据下载 — 历史 OHLCV 数据管理</li>
  <li>? 日志查看器 — 双数据源、级别筛选、实时流</li>
  <li>? 系统托盘 — 最小化到托盘、启动/停止控制</li>
  <li>? 桌面通知 — 交易事件原生通知</li>
  <li>? 无边框窗口 — 自定义标题栏、最小化/最大化/关闭</li>
  <li>? 多平台支持 — Windows / macOS / Linux</li>
</ul>

<h3 id="v0-1-0-tech">技术特性</h3>
<ul>
  <li>Electron 31 + React 18 + TypeScript 5.5</li>
  <li>Vite 5 构建 + Tailwind CSS 样式</li>
  <li>TanStack Query 服务端状态管理</li>
  <li>WebSocket 实时数据推送</li>
  <li>懒加载所有页面组件</li>
  <li>自动重连 + 指数退避</li>
  <li>完整的 TypeScript 类型定义（550+ 行）</li>
  <li>程序化系统托盘图标生成</li>
  <li>单实例锁定</li>
</ul>
