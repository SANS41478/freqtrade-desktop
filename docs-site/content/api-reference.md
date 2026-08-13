API 参考
api-reference
<div class="page-header">
  <span class="badge badge-info">技术参考</span>
  <h1 id="api-reference">API 参考</h1>
  <p class="page-description">Freqtrade Desktop 使用的 REST API 完整参考。</p>
</div>

<h2 id="base-url">基础信息</h2>

<table>
  <thead>
    <tr><th>配置项</th><th>值</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Base URL</strong></td><td><code>http://127.0.0.1:8080/api/v1</code></td></tr>
    <tr><td><strong>认证方式</strong></td><td>HTTP Basic Auth</td></tr>
    <tr><td><strong>Content-Type</strong></td><td><code>application/json</code></td></tr>
  </tbody>
</table>

<div class="callout callout-warning">
  <div class="callout-title">?? 安全提醒</div>
  <p>生产环境请务必修改默认的 API 认证凭据。不要将包含真实密钥的配置提交到版本控制系统。</p>
</div>

<h2 id="info">信息端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/ping</code></td><td>GET</td><td>健康检查</td></tr>
    <tr><td><code>/version</code></td><td>GET</td><td>获取版本号</td></tr>
    <tr><td><code>/show_config</code></td><td>GET</td><td>显示当前配置</td></tr>
    <tr><td><code>/health</code></td><td>GET</td><td>Bot 健康状态</td></tr>
    <tr><td><code>/logs</code></td><td>GET</td><td>获取日志</td></tr>
    <tr><td><code>/sysinfo</code></td><td>GET</td><td>系统资源信息</td></tr>
  </tbody>
</table>

<h2 id="trading">交易端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/balance</code></td><td>GET</td><td>账户余额</td></tr>
    <tr><td><code>/count</code></td><td>GET</td><td>持仓计数</td></tr>
    <tr><td><code>/profit</code></td><td>GET</td><td>收益统计</td></tr>
    <tr><td><code>/status</code></td><td>GET</td><td>当前持仓状态</td></tr>
    <tr><td><code>/trade/{id}</code></td><td>GET</td><td>交易详情</td></tr>
    <tr><td><code>/trades</code></td><td>GET</td><td>交易列表</td></tr>
    <tr><td><code>/forceenter</code></td><td>POST</td><td>强制入场</td></tr>
    <tr><td><code>/forceexit</code></td><td>POST</td><td>强制出场</td></tr>
    <tr><td><code>/start</code></td><td>POST</td><td>启动交易</td></tr>
    <tr><td><code>/stop</code></td><td>POST</td><td>停止交易</td></tr>
    <tr><td><code>/stopentry</code></td><td>POST</td><td>停止新开仓</td></tr>
  </tbody>
</table>

<h2 id="backtest">回测端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/backtest</code></td><td>POST</td><td>启动回测</td></tr>
    <tr><td><code>/backtest</code></td><td>GET</td><td>获取回测状态</td></tr>
    <tr><td><code>/backtest/abort</code></td><td>GET</td><td>中止回测</td></tr>
    <tr><td><code>/backtest/history</code></td><td>GET</td><td>历史回测记录</td></tr>
  </tbody>
</table>

<h2 id="hyperopt">超参数优化</h2>

<p>
  自 Freqtrade 2024.5 起，<code>/hyperopt</code> 系列 REST 端点已被官方移除。
  Freqtrade Desktop 通过 <strong>CLI 子进程</strong>运行超参优化
  （<code>freqtrade hyperopt ...</code>），进度通过桌面端实时输出展示，
  结果保存在 <code>user_data/hyperopt_results/</code> 目录。
</p>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/hyperoptloss</code></td><td>GET</td><td>损失函数列表（webserver 模式）</td></tr>
    <tr><td><code>/background</code></td><td>GET</td><td>后台任务列表（回测/下载/评估进度）</td></tr>
    <tr><td><code>/background/clear</code></td><td>DELETE</td><td>清理已结束的后台任务</td></tr>
  </tbody>
</table>

<h2 id="strategy">策略端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/strategies</code></td><td>GET</td><td>策略列表</td></tr>
    <tr><td><code>/strategy/{name}</code></td><td>GET</td><td>策略详情</td></tr>
  </tbody>
</table>

<h2 id="data">数据端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/download_data</code></td><td>POST</td><td>启动数据下载</td></tr>
    <tr><td><code>/pair_candles</code></td><td>GET/POST</td><td>获取K线数据</td></tr>
    <tr><td><code>/markets</code></td><td>GET</td><td>市场信息</td></tr>
  </tbody>
</table>

<h2 id="other">其他端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/whitelist</code></td><td>GET</td><td>白名单</td></tr>
    <tr><td><code>/blacklist</code></td><td>GET/POST/DELETE</td><td>黑名单管理</td></tr>
    <tr><td><code>/locks</code></td><td>GET/POST/DELETE</td><td>交易锁管理</td></tr>
    <tr><td><code>/performance</code></td><td>GET</td><td>交易对表现</td></tr>
    <tr><td><code>/daily</code></td><td>GET</td><td>每日统计</td></tr>
    <tr><td><code>/weekly</code></td><td>GET</td><td>每周统计</td></tr>
    <tr><td><code>/monthly</code></td><td>GET</td><td>每月统计</td></tr>
  </tbody>
</table>
