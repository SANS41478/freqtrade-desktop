安装指南
installation
<div class="page-header">
  <span class="badge badge-primary">开始使用</span>
  <h1 id="installation">安装指南</h1>
  <p class="page-description">详细的环境搭建和安装步骤，支持 Windows、macOS 和 Linux。</p>
</div>

<h2 id="system-requirements">系统要求</h2>

<table>
  <thead>
    <tr><th>组件</th><th>最低要求</th><th>推荐配置</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>操作系统</strong></td><td>Windows 10 / macOS 12 / Ubuntu 20.04</td><td>最新版本</td></tr>
    <tr><td><strong>Python</strong></td><td>3.11</td><td>3.12+</td></tr>
    <tr><td><strong>Node.js</strong></td><td>18.0</td><td>20 LTS</td></tr>
    <tr><td><strong>内存</strong></td><td>2 GB</td><td>4 GB+</td></tr>
    <tr><td><strong>磁盘</strong></td><td>1 GB 可用空间</td><td>5 GB+</td></tr>
    <tr><td><strong>CPU</strong></td><td>2 vCPU</td><td>4 vCPU+</td></tr>
  </tbody>
</table>

<h2 id="install-prerequisites">安装前置依赖</h2>

<h3 id="install-python">安装 Python</h3>

<div class="code-block"><div class="code-header"><span class="code-lang">Windows (winget)</span></div><pre><code>winget install Python.Python.3.12</code></pre></div>

<div class="code-block"><div class="code-header"><span class="code-lang">macOS (Homebrew)</span></div><pre><code>brew install python@3.12</code></pre></div>

<div class="code-block"><div class="code-header"><span class="code-lang">Linux (Ubuntu/Debian)</span></div><pre><code>sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip</code></pre></div>

<h3 id="install-ta-lib">安装 TA-Lib C 库</h3>

<p>TA-Lib 是 Freqtrade 的核心技术指标库，需要先安装 C 语言底层库。</p>

<div class="code-block"><div class="code-header"><span class="code-lang">Windows</span></div><pre><code># 从 https://github.com/TA-Lib/ta-lib/releases 下载 Windows 二进制包
# 解压后将 ta-lib/include 和 ta-lib/lib 目录添加到系统 PATH</code></pre></div>

<div class="code-block"><div class="code-header"><span class="code-lang">macOS</span></div><pre><code>brew install ta-lib</code></pre></div>

<div class="code-block"><div class="code-header"><span class="code-lang">Linux</span></div><pre><code>wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install</code></pre></div>

<h3 id="install-node">安装 Node.js</h3>

<div class="code-block"><div class="code-header"><span class="code-lang">通用</span></div><pre><code># 推荐使用 nvm 管理 Node.js 版本
# Windows: https://github.com/coreybutler/nvm-windows
# macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20</code></pre></div>

<h2 id="install-freqtrade">安装 Freqtrade</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">bash</span></div><pre><code># 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 安装 Freqtrade
pip install freqtrade

# 验证安装
freqtrade --version</code></pre></div>

<h2 id="install-desktop">安装桌面应用</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">bash</span></div><pre><code># 克隆桌面应用仓库
git clone https://github.com/SANS41478/freqtrade-desktop.git
cd freqtrade-desktop/desktop

# 安装依赖
npm install

# 验证安装
npm run lint</code></pre></div>

<div class="callout callout-success">
  <div class="callout-title">? 安装完成</div>
  <p>现在可以参阅 <a href="quickstart.html">快速开始</a> 启动你的第一个桌面交易终端。</p>
</div>
