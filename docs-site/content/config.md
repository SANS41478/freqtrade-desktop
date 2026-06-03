配置编辑器 config
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="config">配置编辑器</h1>
  <p class="page-description">可视化编辑 Freqtrade 的 config.json，提供结构化表单和实时验证。</p>
</div>

<h2>配置分区（8 个）</h2>
<h3>1. 交易设置</h3>
<p>交易模式、保证金模式、计价货币、每笔金额、最大持仓数、Dry-Run、止损比例</p>

<h3>2. 交易所设置</h3>
<p>交易所名称、API Key/Secret/Password</p>

<h3>3. API 服务器</h3>
<p>启用状态、监听地址/端口、用户名密码、JWT Secret、WebSocket Token</p>

<h3>4. Telegram</h3>
<p>启用状态、Bot Token、Chat ID</p>

<h3>5. 交易对列表</h3>
<p>方法、数量、排序</p>

<h3>6. 订单类型</h3>
<p>入场/出场/止损/强制入场/强制出场/紧急出场 — 每种可独立设置 limit 或 market</p>

<h3>7. 跟踪止损 <span class="badge badge-primary">v0.2.0</span></h3>
<ul>
  <li>启用跟踪止损</li>
  <li>正向偏移量 (如 0.02 = 盈利 2% 后开始跟踪)</li>
  <li>偏移量的偏移量 (如 0.03 = 3% 后偏移量生效)</li>
  <li>仅偏移量到达时才启用</li>
  <li>止损在交易所保存</li>
</ul>

<h3>8. 风控保护 <span class="badge badge-primary">v0.2.0</span></h3>
<ul>
  <li>最大持仓数</li>
  <li>可用资金</li>
  <li>持仓金额</li>
  <li>DCA 加仓</li>
  <li>布局模式 (Spot/Futures)</li>
  <li>短仓允许</li>
</ul>
