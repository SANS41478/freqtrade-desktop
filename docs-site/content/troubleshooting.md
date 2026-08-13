故障排除
troubleshooting
<div class="page-header">
  <span class="badge badge-warning">开发与部署</span>
  <h1 id="troubleshooting">故障排除</h1>
  <p class="page-description">常见问题及解决方案。</p>
</div>

<h2 id="connection">连接问题</h2>

<h3 id="api-not-reachable">无法连接 API 服务器</h3>
<div class="callout callout-error">
  <div class="callout-title">错误: API 服务器未响应</div>
  <p>仪表盘显示「未连接」或「连接失败」。</p>
</div>
<p><strong>解决方案：</strong></p>
<ol>
  <li>确认 Freqtrade API 服务器已启动: <code>freqtrade webserver --config config.json</code></li>
  <li>确认端口未被占用: <code>netstat -an | grep 8080</code></li>
  <li>检查防火墙设置是否阻止了 8080 端口</li>
  <li>确认 config.json 中 <code>api_server.enabled</code> 为 <code>true</code></li>
</ol>

<h3 id="websocket-disconnected">WebSocket 频繁断开</h3>
<p><strong>解决方案：</strong></p>
<ul>
  <li>检查网络稳定性</li>
  <li>确认 WebSocket Token 与 config.json 中的一致</li>
  <li>查看日志中是否有连接超时信息</li>
</ul>

<h2 id="freqtrade-process">Freqtrade 进程问题</h2>

<h3 id="freqtrade-wont-start">Freqtrade 无法启动</h3>
<p><strong>可能原因和解决方案：</strong></p>
<ul>
  <li><strong>Python 未安装</strong>: 确认 <code>python --version</code> 返回 3.11+</li>
  <li><strong>Freqtrade 未安装</strong>: 运行 <code>pip install freqtrade</code></li>
  <li><strong>TA-Lib 缺失</strong>: 参考安装指南安装 TA-Lib C 库</li>
  <li><strong>配置文件错误</strong>: 使用 <code>freqtrade show-config --config config.json</code> 验证配置</li>
</ul>

<h3 id="process-exits">进程自动退出</h3>
<p>查看日志查看器中的错误信息。常见原因：</p>
<ul>
  <li>交易所 API 密钥无效</li>
  <li>网络连接超时</li>
  <li>磁盘空间不足</li>
  <li>内存不足</li>
</ul>

<h2 id="ui-issues">界面问题</h2>

<h3 id="blank-screen">白屏</h3>
<p><strong>解决方案：</strong></p>
<ol>
  <li>检查 Electron 开发者工具中的 Console 错误</li>
  <li>尝试清除应用缓存</li>
  <li>确认 <code>npm run build</code> 成功</li>
</ol>

<h3 id="display-issues">显示异常</h3>
<ul>
  <li><strong>字体模糊</strong>: 检查系统 DPI 设置</li>
  <li><strong>布局错乱</strong>: 调整窗口大小触发重排</li>
</ul>

<h2 id="performance">性能问题</h2>

<h3 id="slow-loading">加载缓慢</h3>
<ul>
  <li>减少同时监控的交易对数量</li>
  <li>降低 API 轮询频率</li>
  <li>关闭不需要的页面</li>
  <li>检查系统资源使用（查看 sysinfo 端点）</li>
</ul>

<h3 id="high-memory">内存占用高</h3>
<ul>
  <li>日志历史过长 — 定期刷新日志</li>
  <li>大量回测历史 — 清理旧的回测记录</li>
  <li>浏览器内存泄漏 — 重启应用</li>
</ul>

<h2 id="logs">日志排查</h2>
<p>打开日志查看器，设置级别为 ERROR，查看最新的错误日志。大部分问题都能在日志中找到线索。</p>

<h2 id="support">获取帮助</h2>
<ul>
  <li>GitHub Issues: <a href="https://github.com/SANS41478/freqtrade-desktop/issues">提交 Issue</a></li>
  <li>Freqtrade Discord: <a href="https://discord.gg/p7nuUNVfP7">加入社区</a></li>
</ul>
