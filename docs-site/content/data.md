数据下载
data
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="data">数据下载</h1>
  <p class="page-description">下载和管理历史 OHLCV 数据，为回测和策略开发提供数据支撑。</p>
</div>

<h2 id="overview">概述</h2>
<p>数据下载页面封装了 Freqtrade 的数据管理功能，支持从交易所下载历史K线数据，并管理本地数据文件。</p>

<h2 id="download">下载配置</h2>

<table>
  <thead>
    <tr><th>参数</th><th>类型</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>交易对</strong></td><td>多选</td><td>选择要下载的交易对</td></tr>
    <tr><td><strong>时间框架</strong></td><td>多选</td><td>1m / 5m / 15m / 1h 等</td></tr>
    <tr><td><strong>天数</strong></td><td>数字</td><td>下载最近 N 天的数据</td></tr>
    <tr><td><strong>时间范围</strong></td><td>文本</td><td>精确时间范围，如 20240101-20240601</td></tr>
    <tr><td><strong>数据格式</strong></td><td>下拉</td><td>json / feather / parquet</td></tr>
  </tbody>
</table>

<h2 id="file-management">数据文件管理</h2>
<p>显示本地已下载的数据文件列表，包含：</p>
<ul>
  <li>文件名（交易对-时间框架-日期.格式）</li>
  <li>文件大小</li>
  <li>数据格式</li>
  <li>支持删除操作</li>
</ul>

<h2 id="file-system">文件系统</h2>
<p>数据文件存储在 <code>user_data/data/{exchange}/</code> 目录下。通过 Electron IPC 管理文件的读取和删除。</p>

<h2 id="api-endpoints">相关 API 端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/download_data</code></td><td>POST</td><td>启动数据下载</td></tr>
  </tbody>
</table>
