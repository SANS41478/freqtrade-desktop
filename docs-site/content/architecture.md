架构概览 architecture
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="architecture">架构概览</h1>
</div>

<h2>技术栈</h2>
<table><thead><tr><th>层级</th><th>技术</th><th>用途</th></tr></thead>
<tbody>
  <tr><td>桌面框架</td><td>Electron 31</td><td>窗口管理+系统集成</td></tr>
  <tr><td>UI</td><td>React 18 + TypeScript</td><td>界面构建</td></tr>
  <tr><td>样式</td><td>Tailwind CSS</td><td>工具类+变量</td></tr>
  <tr><td>状态</td><td>TanStack Query</td><td>服务端状态管理</td></tr>
  <tr><td>图表</td><td>Recharts + Lightweight Charts</td><td>数据可视化</td></tr>
  <tr><td>编辑器</td><td>Monaco Editor</td><td>策略代码编辑</td></tr>
</tbody></table>

<h2>页面路由</h2>
<p>Tab 路由 + React.lazy() 懒加载。</p>
<table><thead><tr><th>Tab</th><th>组件</th><th>描述</th></tr></thead>
<tbody>
  <tr><td>dashboard</td><td>Dashboard</td><td>仪表盘</td></tr>
  <tr><td>trades</td><td>TradesPage</td><td>交易记录</td></tr>
  <tr><td>backtest</td><td>BacktestPage</td><td>回测中心</td></tr>
  <tr><td>hyperopt</td><td>HyperoptPage</td><td>超参数优化</td></tr>
  <tr><td>strategy</td><td>StrategyPage</td><td>策略管理</td></tr>
  <tr><td>config</td><td>ConfigEditor</td><td>配置编辑</td></tr>
  <tr><td>pairlist</td><td>PairlistPage</td><td>交易对列表</td></tr>
  <tr><td>candles</td><td>Candles</td><td>K线图表</td></tr>
  <tr><td>data</td><td>DataDownload</td><td>数据下载</td></tr>
  <tr><td>logs</td><td>LogViewer</td><td>日志查看</td></tr>
  <tr><td>trade-detail</td><td>TradeDetail</td><td>交易详情</td></tr>
  <tr><td>management</td><td>ManagementPage</td><td>交易管理</td></tr>
</tbody></table>

<h2>v0.2.0 新增组件</h2>
<ul>
  <li><strong>PairlistPage</strong>: 交易对列表过滤器配置</li>
  <li><strong>Toast</strong>: 全局通知系统</li>
  <li><strong>auth-config</strong>: 集中化认证配置</li>
</ul>

<h2>安全</h2>
<ul>
  <li>Context Isolation: 渲染与主进程隔离</li>
  <li>Preload: 只暴露安全 API</li>
  <li>auth-config: 环境变量驱动</li>
</ul>
