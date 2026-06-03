部署指南
deployment
<div class="page-header">
  <span class="badge badge-warning">开发与部署</span>
  <h1 id="deployment">部署指南</h1>
  <p class="page-description">构建和分发 Freqtrade Desktop 应用程序。</p>
</div>

<h2 id="build">构建应用</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">bash</span></div><pre><code># 构建生产版本
npm run electron:build

# 构建过程：
# 1. TypeScript 编译 (tsc)
# 2. Vite 构建前端资源
# 3. electron-builder 打包桌面应用
# 4. 输出到 release/ 目录</code></pre></div>

<h2 id="output">构建产物</h2>

<table>
  <thead>
    <tr><th>平台</th><th>格式</th><th>输出路径</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Windows</strong></td><td>NSIS 安装包</td><td><code>release/Freqtrade Desktop Setup.exe</code></td></tr>
    <tr><td><strong>macOS</strong></td><td>DMG 磁盘映像</td><td><code>release/Freqtrade Desktop.dmg</code></td></tr>
    <tr><td><strong>Linux</strong></td><td>AppImage</td><td><code>release/Freqtrade Desktop.AppImage</code></td></tr>
  </tbody>
</table>

<h2 id="bundled-resources">打包资源</h2>
<p>构建时会自动将以下文件打包到应用中：</p>
<ul>
  <li><code>user_data/config.json</code> → 应用资源目录</li>
  <li><code>user_data/strategies/</code> → 应用资源目录</li>
</ul>

<h2 id="production-config">生产环境配置</h2>

<h3 id="file-paths">文件路径策略</h3>
<ul>
  <li><strong>配置文件</strong>: 优先使用 <code>userData/config.json</code>，回退到 bundled 资源</li>
  <li><strong>策略目录</strong>: 优先使用 <code>userData/strategies/</code>，回退到 bundled 资源</li>
  <li><strong>数据目录</strong>: <code>userData/user_data/data/{exchange}/</code></li>
</ul>

<h3 id="security">安全配置</h3>
<div class="callout callout-warning">
  <div class="callout-title">?? 生产环境安全清单</div>
  <ul>
    <li>修改默认的 API 认证凭据</li>
    <li>修改 WebSocket Token</li>
    <li>修改 JWT Secret Key</li>
    <li>限制 API 监听地址（不要使用 0.0.0.0）</li>
    <li>配置防火墙规则</li>
  </ul>
</div>

<h2 id="auto-start">开机自启</h2>
<p>Windows 安装包支持开机自启。可以通过系统托盘菜单控制 Freqtrade 的启动和停止。</p>

<h2 id="system-tray">系统托盘</h2>
<ul>
  <li><strong>最小化到托盘</strong>: 关闭窗口后应用仍在托盘运行</li>
  <li><strong>双击恢复</strong>: 双击托盘图标恢复窗口</li>
  <li><strong>右键菜单</strong>: 启动/停止 Freqtrade、显示/隐藏窗口、退出</li>
</ul>

<h2 id="multi-instance">单实例限制</h2>
<p>应用使用 <code>app.requestSingleInstanceLock()</code> 防止多开。第二次启动时会激活已有窗口。</p>
