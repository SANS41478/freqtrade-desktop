交易仪表盘
dashboard
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="dashboard">交易仪表盘</h1>
  <p class="page-description">实时监控交易状态、账户余额、收益曲线和持仓情况。</p>
</div>

<h2 id="overview">概述</h2>
<p>交易仪表盘是 Freqtrade Desktop 的默认首页，提供交易活动的全面概览。所有数据通过 TanStack Query 自动刷新，持仓数据通过 WebSocket 实时更新。</p>

<h2 id="metrics">核心指标卡片</h2>

<table>
  <thead>
    <tr><th>指标</th><th>数据源</th><th>刷新频率</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>总权益</strong></td><td><code>/api/v1/balance</code></td><td>10 秒</td><td>账户总资产（含持仓估值）</td></tr>
    <tr><td><strong>持仓中</strong></td><td><code>/api/v1/count</code></td><td>5 秒</td><td>当前持仓数 / 最大允许数</td></tr>
    <tr><td><strong>胜率</strong></td><td><code>/api/v1/profit</code></td><td>30 秒</td><td>盈利交易占比</td></tr>
    <tr><td><strong>夏普比率</strong></td><td><code>/api/v1/profit</code></td><td>30 秒</td><td>风险调整收益指标</td></tr>
  </tbody>
</table>

<h2 id="sections">页面区域</h2>

<h3 id="price-ticker">实时价格 Ticker</h3>
<p>显示白名单中交易对的实时价格，每 5 秒从 API 刷新。支持 BTC/USDT、ETH/USDT 等主流交易对。</p>

<h3 id="equity-chart">权益曲线图</h3>
<p>基于 Recharts 的面积图，展示每日收益变化趋势。数据来自 <code>/api/v1/daily</code> 接口。</p>

<h3 id="open-positions">当前持仓</h3>
<p>显示所有未平仓交易，包含交易对、方向、盈亏、收益率等信息。点击行可跳转至交易详情页。</p>

<h3 id="force-entry">强制入场</h3>
<p>快速入场表单，支持以下参数：</p>
<ul>
  <li><strong>交易对</strong>: 如 BTC/USDT</li>
  <li><strong>方向</strong>: 多头 / 空头</li>
  <li><strong>订单类型</strong>: 限价单 / 市价单</li>
  <li><strong>入场价格</strong>: 可选</li>
  <li><strong>金额</strong>: 可选</li>
</ul>

<h3 id="recent-trades">最近成交</h3>
<p>最近 5 笔已完成交易的列表，包含交易对、方向、盈亏、持仓时长。点击行跳转交易详情。</p>

<h3 id="weekly-monthly">每周/每月收益</h3>
<p>收益统计表，展示近 12 个周期的收益百分比。</p>

<h2 id="api-endpoints">相关 API 端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/balance</code></td><td>GET</td><td>账户余额</td></tr>
    <tr><td><code>/api/v1/count</code></td><td>GET</td><td>持仓计数</td></tr>
    <tr><td><code>/api/v1/profit</code></td><td>GET</td><td>收益统计</td></tr>
    <tr><td><code>/api/v1/status</code></td><td>GET</td><td>当前持仓状态</td></tr>
    <tr><td><code>/api/v1/daily</code></td><td>GET</td><td>每日收益</td></tr>
    <tr><td><code>/api/v1/forceenter</code></td><td>POST</td><td>强制入场</td></tr>
    <tr><td><code>/api/v1/forceexit</code></td><td>POST</td><td>强制出场</td></tr>
  </tbody>
</table>
