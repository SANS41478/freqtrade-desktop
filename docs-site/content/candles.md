K线图表
candles
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="candles">K线图表</h1>
  <p class="page-description">交互式金融K线图，支持多时间框架和买卖信号标注。</p>
</div>

<h2 id="overview">概述</h2>
<p>K线图表页面基于 TradingView 的 Lightweight Charts 库，提供专业级的金融数据可视化。</p>

<h2 id="features">功能特性</h2>
<ul>
  <li><strong>专业K线图</strong>: 支持蜡烛图、成交量图</li>
  <li><strong>时间框架切换</strong>: 1m / 5m / 15m / 1h / 4h / 1d</li>
  <li><strong>交易对选择</strong>: 从白名单中选择交易对</li>
  <li><strong>买卖信号</strong>: 在K线上标注入场和出场信号</li>
  <li><strong>交互操作</strong>: 缩放、拖拽、十字光标</li>
</ul>

<h2 id="data-source">数据来源</h2>
<p>图表数据通过 Freqtrade API 的 <code>/api/v1/pair_candles</code> 端点获取，返回指定交易对和时间框架的 OHLCV 数据。</p>

<h2 id="api-endpoints">相关 API 端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/pair_candles</code></td><td>GET/POST</td><td>获取K线数据</td></tr>
    <tr><td><code>/api/v1/whitelist</code></td><td>GET</td><td>获取可用交易对</td></tr>
  </tbody>
</table>
