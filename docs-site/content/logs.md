日志查看器
logs
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="logs">日志查看器</h1>
  <p class="page-description">实时查看 Freqtrade 运行日志，支持级别筛选和搜索。</p>
</div>

<h2 id="overview">概述</h2>
<p>日志查看器结合了两个数据源：REST API 返回的结构化日志和 Electron 捕获的 stdout/stderr 实时输出，提供完整的日志查看体验。</p>

<h2 id="features">功能特性</h2>

<h3 id="dual-source">双数据源</h3>
<ul>
  <li><strong>API 日志</strong>: Freqtrade 内部结构化日志（时间、级别、模块、消息）</li>
  <li><strong>实时流</strong>: Electron 捕获的 Python 进程 stdout/stderr 输出</li>
</ul>

<h3 id="filtering">筛选功能</h3>
<ul>
  <li><strong>级别筛选</strong>: DEBUG / INFO / WARNING / ERROR</li>
  <li><strong>文本搜索</strong>: 搜索日志内容和模块名</li>
  <li><strong>级别计数</strong>: 显示每个级别的日志数量</li>
</ul>

<h3 id="controls">控制功能</h3>
<ul>
  <li><strong>暂停/恢复</strong>: 暂停实时日志接收</li>
  <li><strong>自动滚动</strong>: 新日志自动滚动到底部</li>
  <li><strong>复制</strong>: 一键复制所有日志到剪贴板</li>
  <li><strong>刷新</strong>: 重新加载 API 日志</li>
</ul>

<h3 id="display">显示格式</h3>
<p>每行日志包含以下列：</p>
<ul>
  <li>时间戳</li>
  <li>级别（彩色标注：ERROR 红色、WARNING 黄色、LIVE 绿色）</li>
  <li>模块名</li>
  <li>消息内容</li>
</ul>

<h2 id="api-endpoints">相关 API 端点</h2>

<table>
  <thead>
    <tr><th>端点</th><th>方法</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/logs</code></td><td>GET</td><td>获取结构化日志</td></tr>
  </tbody>
</table>
