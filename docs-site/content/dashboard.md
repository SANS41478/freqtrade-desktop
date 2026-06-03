交易仪表盘 dashboard
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="dashboard">交易仪表盘</h1>
  <p class="page-description">实时监控交易状态、账户余额、收益曲线和持仓情况。</p>
</div>

<h2 id="overview">概述</h2>
<p>交易仪表盘是 Freqtrade Desktop 的默认页面，提供交易活动的全面可视化。数据通过 TanStack Query 自动刷新，持仓数据通过 WebSocket 实时更新。</p>

<h2 id="status">运行状态标记</h2>
<ul>
  <li><strong>运行中</strong> — 策略已启动</li>
  <li><strong>Dry-Run 模式</strong> — 模拟交易</li>
  <li><strong>未连接</strong> — API 服务不可用</li>
</ul>

<h2 id="metrics">核心指标</h2>
<table><thead><tr><th>指标</th><th>数据源</th><th>刷新</th><th>说明</th></tr></thead>
<tbody>
  <tr><td><strong>总权益</strong></td><td><code>/api/v1/balance</code></td><td>10秒</td><td>账户总资产</td></tr>
  <tr><td><strong>持仓中</strong></td><td><code>/api/v1/count</code></td><td>5秒</td><td>当前持仓数</td></tr>
  <tr><td><strong>胜率</strong></td><td><code>/api/v1/profit</code></td><td>30秒</td><td>盈利交易占比</td></tr>
  <tr><td><strong>夏普比</strong></td><td><code>/api/v1/profit</code></td><td>30秒</td><td>风险调整收益</td></tr>
</tbody></table>

<h2 id="sections">页面区域</h2>
<h3 id="sysinfo">系统状态</h3>
<p>CPU、内存、策略、时间框架、交易所、运行时长。</p>

<h3 id="price-ticker">实时价格</h3>
<p>WebSocket 实时推送价格。</p>

<h3 id="open-positions">当前持仓</h3>
<p>支持强制平仓和跳转详情。</p>

<h3 id="force-entry">强制入场</h3>
<p>支持交易对、方向、订单类型、价格、金额。</p>

<h3 id="performance">绩效名</h3>
<p>盈利/亏损最多交易对。</p>

<h3 id="entry-tags">入场标签</h3>
<p>标签交易笔数和收益率。</p>

<h3 id="exit-reasons">出场原因</h3>
<p>原因交易笔数和盈亏。</p>

<h3 id="recent">最近成交</h3>
<p>最近 5 笔交易。</p>

<h3 id="weekly">每周/每月收益</h3>
<p>近 12 周期收益。</p>

<h2 id="api">相关 API</h2>
<table><thead><tr><th>端点</th><th>方法</th><th>说明</th></tr></thead>
<tbody>
  <tr><td><code>/api/v1/balance</code></td><td>GET</td><td>余额</td></tr>
  <tr><td><code>/api/v1/count</code></td><td>GET</td><td>持仓</td></tr>
  <tr><td><code>/api/v1/profit</code></td><td>GET</td><td>收益</td></tr>
  <tr><td><code>/api/v1/status</code></td><td>GET</td><td>状态</td></tr>
  <tr><td><code>/api/v1/health</code></td><td>GET</td><td>健康</td></tr>
  <tr><td><code>/api/v1/sysinfo</code></td><td>GET</td><td>系统信息</td></tr>
  <tr><td><code>/api/v1/performance</code></td><td>GET</td><td>绩效</td></tr>
  <tr><td><code>/api/v1/entries</code></td><td>GET</td><td>入场标签</td></tr>
  <tr><td><code>/api/v1/exits</code></td><td>GET</td><td>出场原因</td></tr>
  <tr><td><code>/api/v1/forceenter</code></td><td>POST</td><td>强制入场</td></tr>
  <tr><td><code>/api/v1/forceexit</code></td><td>POST</td><td>强制出场</td></tr>
</tbody></table>
