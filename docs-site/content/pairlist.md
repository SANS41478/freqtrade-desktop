交易对列表 pairlist
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="pairlist">交易对列表</h1>
  <p class="page-description">配置和评估 Pairlist 过滤器链，生成交易对白名单。</p>
</div>

<h2 id="features">功能</h2>
<h3>可用过滤器</h3>
<p>VolumePairList、StaticPairList、AgeFilter、SpreadFilter、PriceFilter 等。</p>

<h3>过滤器链配置</h3>
<p>拖拽排序、移除不需要的过滤器。</p>

<h3>评估</h3>
<p>点击评估调用 API 生成白名单。</p>

<h2 id="api">API</h2>
<table><thead><tr><th>端点</th><th>方法</th><th>说明</th></tr></thead>
<tbody>
  <tr><td><code>/api/v1/pairlists/available</code></td><td>GET</td><td>可用过滤器</td></tr>
  <tr><td><code>/api/v1/pairlists/evaluate</code></td><td>POST</td><td>评估</td></tr>
</tbody></table>
