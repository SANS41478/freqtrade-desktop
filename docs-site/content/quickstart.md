快速开始 quickstart
<div class="page-header">
  <span class="badge badge-primary">开始使用</span>
  <h1 id="quickstart">快速开始</h1>
  <p class="page-description">3 分钟内启动 Freqtrade Desktop。</p>
</div>

<h2 id="prerequisites">前置条件</h2>
<ul>
  <li><strong>Node.js</strong> 18+</li>
  <li><strong>npm</strong> 9+</li>
  <li>Freqtrade 已安装并运行 API 服务器</li>
</ul>

<h2 id="steps">步骤</h2>

<h3>1. 克隆仓库</h3>
<div class="code-block"><div class="code-header"><span class="code-lang">Bash</span></div><pre><code>git clone https://github.com/SANS41478/freqtrade-desktop.git
cd freqtrade-desktop
npm install
</code></pre></div>

<h3>2. 启动 Freqtrade API 服务器</h3>
<div class="code-block"><div class="code-header"><span class="code-lang">Bash</span></div><pre><code>freqtrade api-server --config user_data/config.json
</code></pre></div>

<h3>3. 启动开发服务器</h3>
<div class="code-block"><div class="code-header"><span class="code-lang">Bash</span></div><pre><code>npm run dev
</code></pre></div>

<h3>4. 打开浏览器</h3>
<p>访问 <code>http://localhost:5173</code></p>

<h2 id="electron">Electron 桌面模式</h2>
<div class="code-block"><div class="code-header"><span class="code-lang">Bash</span></div><pre><code>npm run electron:dev   # 开发模式（热重载）
npm run electron:build  # 打包发行版
</code></pre></div>