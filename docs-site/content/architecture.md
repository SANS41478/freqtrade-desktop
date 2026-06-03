架构概览 architecture
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="architecture">架构概览</h1>
  <p class="page-description">深入了解 Freqtrade Desktop 的技术架构和设计理念。</p>
</div>

<h2 id="overview">整体架构</h2>
<p>Electron 三层架构：主进程（main）、预加载脚本（preload）、渲染进程（React）。</p>

<h2 id="tech-stack">技术栈</h2>
<table>
  <thead><tr><th>层级</th><th>技术</th><th>用途</th></tr></thead>
  <tbody>
    <tr><td>桌面框架</td><td>Electron 31</td><td>窗口管理+系统集成</td></tr>
    <tr><td>UI</td><td>React 18 + TypeScript</td><td>界面构建</td></tr>
    <tr><td>样式</td><td>Tailwind CSS</td><td>工具类+变量</td></tr>
    <tr><td>状态</td><td>TanStack Query</td><td>服务端状态管理</td></tr>
    <tr><td>图表</td><td>Recharts + Lightweight Charts</td><td>数据可视化</td></tr>
    <tr><td>编辑器</td><td>Monaco Editor</td><td>策略代码编辑</td></tr>
    <tr><td>构建</td><td>Vite</td><td>开发+生产</td></tr>
  </tbody>
</table>

<h2 id="pages">页面路由</h2>
<p>Tab 路由 + React.lazy() 懒加载。</p>
<table>
  <thead><tr><th>Tab ID</th><th>组件</th><th>描述</th></tr></thead>
  <tbody>
    <tr><td><code>dashboard</code></td><td>Dashboard</td><td>交易仪表盘</td></tr>
    <tr><td><code>trades</code></td><td>TradesPage</td><td>交易记录</td></tr>
    <tr><td><code>backtest</code></td><td>BacktestPage</td><td>回测中心</td></tr>
    <tr><td><code>hyperopt</code></td><td>HyperoptPage</td><td>超参数优化</td></tr>
    <tr><td><code>strategy</code></td><td>StrategyPage</td><td>策略管理</td></tr>
    <tr><td><code>config</code></td><td>ConfigEditor</td><td>配置编辑器</td></tr>
    <tr><td><code>pairlist</code></td><td>PairlistPage</td><td>交易对列表</td></tr>
    <tr><td><code>candles</code></td><td>Candles</td><td>K线图表</td></tr>
    <tr><td><code>data</code></td><td>DataDownload</td><td>数据下载</td></tr>
    <tr><td><code>logs</code></td><td>LogViewer</td><td>日志查看器</td></tr>
    <tr><td><code>trade-detail</code></td><td>TradeDetail</td><td>交易详情</td></tr>
    <tr><td><code>management</code></td><td>ManagementPage</td><td>交易管理</td></tr>
  </tbody>
</table>

<h2 id="new-components">新增组件（v0.2.0）</h2>
<ul>
  <li><strong>PairlistPage</strong>: 交易对列表过滤器配置和评估</li>
  <li><strong>Toast</strong>: 全局通知系统（ToastProvider + useToast）</li>
  <li><strong>auth-config</strong>: 集中化认证配置（环境变量驱动）</li>
</ul>

<h2 id="data-flow">数据流</h2>
<h3>REST API</h3>
<ol>
  <li>React 组件 &rarr; useQuery()</li>
  <li>TanStack Query &rarr; http://127.0.0.1:8080/api/v1/...</li>
  <li>Freqtrade API Server &rarr; JSON</li>
  <li>TanStack Query 缓存并触发重渲染</li>
</ol>

<h3>WebSocket</h3>
<ol>
  <li>FreqtradeWebSocket 建立连接</li>
  <li>subscribe() 订阅消息类型</li>
  <li>dispatch() 路由到处理器</li>
</ol>

<h2 id="security">安全设计</h2>
<ul>
  <li>Context Isolation: 渲染进程和主进程完全隔离</li>
  <li>Preload: 只暴露安全 API</li>
  <li>auth-config: 环境变量驱动，不硬编码凭证</li>
  <li>单实例锁定</li>
</ul>