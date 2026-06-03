回测中心
backtest
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="backtest">回测中心</h1>
  <p class="page-description">运行历史数据回测，可视化分析策略表现，支持多策略对比。</p>
</div>

<h2 id="overview">概述</h2>
<p>回测中心让用户在不投入真金白银的情况下，用历史数据验证交易策略的有效性。支持完整的回测配置、实时进度追踪和详细的结果分析。</p>

<h2 id="configuration">回测配置</h2>

<table>
  <thead>
    <tr><th>参数</th><th>类型</th><th>默认值</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>策略</strong></td><td>下拉选择</td><td>-</td><td>选择要回测的策略</td></tr>
    <tr><td><strong>时间框架</strong></td><td>下拉选择</td><td>5m</td><td>K线周期</td></tr>
    <tr><td><strong>时间范围</strong></td><td>文本输入</td><td>全部数据</td><td>如 20240101-20241231</td></tr>
    <tr><td><strong>最大持仓</strong></td><td>数字输入</td><td>3</td><td>同时最大持仓数</td></tr>
    <tr><td><strong>起始资金</strong></td><td>数字输入</td><td>1000</td><td>模拟起始资金 (USDT)</td></tr>
    <tr><td><strong>缓存策略</strong></td><td>下拉选择</td><td>day</td><td>缓存粒度</td></tr>
  </tbody>
</table>

<h2 id="results">回测结果</h2>

<h3 id="summary-metrics">核心指标</h3>
<ul>
  <li><strong>总收益率</strong>: 策略总回报率</li>
  <li><strong>总成交笔数</strong>: 回测期间的交易次数</li>
  <li><strong>胜率</strong>: 盈利交易占比</li>
  <li><strong>最大回撤</strong>: 最大资金回撤幅度</li>
  <li><strong>夏普比率</strong>: 风险调整收益</li>
  <li><strong>利润因子</strong>: 总盈利 / 总亏损</li>
</ul>

<h3 id="visualization">可视化分析</h3>
<p>回测完成后，页面展示完整的可视化分析，包含：</p>
<ul>
  <li>权益曲线（Equity Curve）</li>
  <li>逐笔交易分布</li>
  <li>按交易对的收益分布</li>
  <li>月度收益热力图</li>
  <li>持仓时长分布</li>
</ul>

<h2 id="comparison">策略对比</h2>
<p>支持选择最多 5 次回测记录进行横向对比，比较各项指标差异。对比维度包括：</p>
<ul>
  <li>总收益率、总盈利</li>
  <li>胜率、成交笔数</li>
  <li>最大回撤、夏普比率</li>
  <li>利润因子</li>
</ul>

<h2 id="history">历史记录</h2>
<p>所有回测记录自动保存，可随时查看历史结果、重新加载或删除。</p>

<h2 id="api-endpoints">相关 API 端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/backtest</code></td><td>POST</td><td>启动回测</td></tr>
    <tr><td><code>/api/v1/backtest</code></td><td>GET</td><td>获取回测状态</td></tr>
    <tr><td><code>/api/v1/backtest/abort</code></td><td>POST</td><td>中止回测</td></tr>
    <tr><td><code>/api/v1/backtest/history</code></td><td>GET</td><td>历史回测列表</td></tr>
  </tbody>
</table>
