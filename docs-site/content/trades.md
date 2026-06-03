交易管理
trades
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="trades">交易管理</h1>
  <p class="page-description">查看完整交易历史，支持多维筛选和 CSV 导出。</p>
</div>

<h2 id="overview">概述</h2>
<p>交易管理页面展示所有历史交易记录，提供强大的筛选和导出功能。</p>

<h2 id="features">功能特性</h2>

<h3 id="trade-list">交易列表</h3>
<p>分页展示交易记录，每页 20 条。每行显示：</p>
<ul>
  <li>交易 ID</li>
  <li>交易对</li>
  <li>方向（多头/空头）</li>
  <li>入场价格 / 出场价格</li>
  <li>数量</li>
  <li>盈亏金额 / 收益率</li>
  <li>持仓时长</li>
  <li>入场标签 / 出场原因</li>
</ul>

<h3 id="filters">多维筛选</h3>

<table>
  <thead>
    <tr><th>筛选器</th><th>类型</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>交易对</strong></td><td>下拉选择</td><td>按交易对过滤</td></tr>
    <tr><td><strong>方向</strong></td><td>下拉选择</td><td>多头 / 空头</td></tr>
    <tr><td><strong>结果</strong></td><td>下拉选择</td><td>盈利 / 亏损</td></tr>
    <tr><td><strong>文本搜索</strong></td><td>输入框</td><td>搜索入场标签和出场原因</td></tr>
  </tbody>
</table>

<h3 id="summary-stats">汇总统计</h3>
<p>页面顶部显示当前筛选结果的汇总：总交易数、胜场、负场、胜率、总盈亏。</p>

<h3 id="csv-export">CSV 导出</h3>
<p>点击「导出 CSV」按钮，将所有交易记录导出为 UTF-8 BOM 编码的 CSV 文件，方便在 Excel 中查看。</p>

<h3 id="trade-detail">交易详情</h3>
<p>点击任意交易行可跳转至交易详情页面，查看完整的交易时间线、订单信息和自定义数据。</p>

<h2 id="api-endpoints">相关 API 端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/trades</code></td><td>GET</td><td>交易列表（分页）</td></tr>
    <tr><td><code>/api/v1/trade/{id}</code></td><td>GET</td><td>交易详情</td></tr>
    <tr><td><code>/api/v1/trades/{id}</code></td><td>DELETE</td><td>删除交易</td></tr>
    <tr><td><code>/api/v1/trades/{id}/reload</code></td><td>POST</td><td>刷新交易数据</td></tr>
  </tbody>
</table>
