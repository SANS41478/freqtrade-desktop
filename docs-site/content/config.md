配置编辑器
config
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="config">配置编辑器</h1>
  <p class="page-description">可视化编辑 Freqtrade 的 config.json，提供结构化表单和实时验证。</p>
</div>

<h2 id="overview">概述</h2>
<p>配置编辑器将复杂的 JSON 配置文件转化为直观的可视化表单，分为 6 个配置分区，降低配置门槛。</p>

<h2 id="sections">配置分区</h2>

<h3 id="trading">交易设置</h3>
<ul>
  <li><strong>交易模式</strong>: Spot / Margin / Futures</li>
  <li><strong>保证金模式</strong>: Cross / Isolated</li>
  <li><strong>计价货币</strong>: 如 USDT、BTC</li>
  <li><strong>每笔金额</strong>: 固定金额或 unlimited</li>
  <li><strong>最大持仓数</strong>: 同时持有的最大交易数</li>
  <li><strong>Dry-Run</strong>: 模拟交易开关</li>
  <li><strong>止损比例</strong>: 如 -10%</li>
  <li><strong>追踪止损</strong>: 启用/禁用</li>
</ul>

<h3 id="exchange-settings">交易所设置</h3>
<ul>
  <li><strong>交易所名称</strong>: binance / okx / bybit 等</li>
  <li><strong>API Key</strong>: 交易所 API 密钥</li>
  <li><strong>API Secret</strong>: 交易所 API 密钥</li>
  <li><strong>Password</strong>: 部分交易所需要的额外密码</li>
</ul>

<h3 id="api-server">API 服务器</h3>
<ul>
  <li><strong>启用状态</strong>: 是否启用 API 服务器</li>
  <li><strong>监听地址</strong>: 默认 127.0.0.1</li>
  <li><strong>监听端口</strong>: 默认 8080</li>
  <li><strong>用户名/密码</strong>: API 认证凭据</li>
</ul>

<h3 id="telegram">Telegram</h3>
<ul>
  <li><strong>启用状态</strong>: 是否启用 Telegram 通知</li>
  <li><strong>Bot Token</strong>: Telegram Bot Token</li>
  <li><strong>Chat ID</strong>: 接收通知的 Chat ID</li>
</ul>

<h3 id="pairlists">交易对列表</h3>
<ul>
  <li><strong>方法</strong>: VolumePairList / StaticPairList</li>
  <li><strong>数量</strong>: 交易对数量</li>
  <li><strong>排序</strong>: 按成交额/成交量排序</li>
</ul>

<h3 id="order-types">订单类型</h3>
<ul>
  <li>入场单、出场单、止损单、强制入场、强制出场、紧急出场</li>
  <li>每种订单可独立设置 limit 或 market</li>
</ul>

<h2 id="operations">操作功能</h2>

<table>
  <thead>
    <tr><th>操作</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>保存配置</strong></td><td>将表单数据写入 config.json</td></tr>
    <tr><td><strong>验证配置</strong></td><td>使用 JSON Schema 验证配置</td></tr>
    <tr><td><strong>导出配置</strong></td><td>导出配置到指定位置</td></tr>
    <tr><td><strong>导入配置</strong></td><td>从文件导入配置</td></tr>
  </tbody>
</table>
