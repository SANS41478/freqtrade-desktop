交易记录 trades
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="trades">交易记录</h1>
  <p class="page-description">完整交易历史，多维筛选、排序、日期范围、CSV导出。</p>
</div>

<h2 id="summary">汇总统计</h2>
<p>顶部展示 5 个关键指标：总交易数、盈利数、亏损数、总盈亏、胜率。</p>

<h2 id="filters">筛选器</h2>
<ul>
  <li><strong>搜索</strong>: 按标签/出场原因搜索</li>
  <li><strong>交易对</strong>: 下拉筛选具体交易对</li>
  <li><strong>方向</strong>: 多头 / 空头</li>
  <li><strong>结果</strong>: 盈利 / 亏损</li>
  <li><strong>日期范围</strong>: 开始日期 → 结束日期</li>
</ul>

<h2 id="sorting">排序</h2>
<p>点击列表头可排序：交易对、盈亏、收益率、持仓时长。支持升序/降序切换。</p>

<h2 id="export">CSV 导出</h2>
<p>导出当前筛选结果为 UTF-8 CSV 文件。</p>

<h2 id="force-exit">强制平仓</h2>
<p>开仓交易显示强制平仓按钮，可选市价/限价下单。</p>

<h2 id="api">相关 API</h2>
<table><thead><tr><th>端点</th><th>方法</th><th>说明</th></tr></thead>
<tbody>
  <tr><td><code>/api/v1/trades</code></td><td>GET</td><td>交易列表</td></tr>
  <tr><td><code>/api/v1/trade/:id</code></td><td>GET</td><td>交易详情</td></tr>
  <tr><td><code>/api/v1/forceexit</code></td><td>POST</td><td>强制出场</td></tr>
</tbody></table>
