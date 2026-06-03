架构概览
architecture
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="architecture">架构概览</h1>
  <p class="page-description">深入了解 Freqtrade Desktop 的技术架构和设计理念。</p>
</div>

<h2 id="overview">整体架构</h2>

<p>Freqtrade Desktop 采用经典的 Electron 三层架构：主进程（Main Process）、预加载脚本（Preload Script）、渲染进程（Renderer Process）。渲染进程通过 React 构建 UI，通过 REST API 和 WebSocket 与 Freqtrade Python 后端通信。</p>

<div class="code-block"><div class="code-header"><span class="code-lang">架构图</span></div><pre><code>┌─────────────────────────────────────────────────────┐
│                 Electron Desktop Shell              │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │          Main Process (main.ts)               │  │
│  │  · 窗口管理 (无边框 + 自定义标题栏)          │  │
│  │  · 系统托盘 (启动/停止/状态)                 │  │
│  │  · Freqtrade 子进程管理                      │  │
│  │  · IPC 桥接 (文件读写、策略、配置)           │  │
│  └───────────────────────────────────────────────┘  │
│                         │ IPC                        │
│  ┌───────────────────────────────────────────────┐  │
│  │          Renderer Process (React)             │  │
│  │                                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │  │
│  │  │Dashboard │ │ Backtest │ │ Strategy │     │  │
│  │  │ Trades   │ │Hyperopt  │ │ Config   │     │  │
│  │  │ Candles  │ │  Data    │ │  Logs    │     │  │
│  │  └──────────┘ └──────────┘ └──────────┘     │  │
│  └───────────────────────────────────────────────┘  │
│                    │ REST API + WebSocket            │
│  ┌───────────────────────────────────────────────┐  │
│  │      Freqtrade Python Backend (port 8080)     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘</code></pre></div>

<h2 id="tech-stack">技术栈详解</h2>

<table>
  <thead>
    <tr><th>层级</th><th>技术</th><th>版本</th><th>用途</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>桌面壳层</strong></td><td>Electron</td><td>31.x</td><td>跨平台桌面应用容器</td></tr>
    <tr><td><strong>UI 框架</strong></td><td>React</td><td>18.x</td><td>声明式 UI 构建</td></tr>
    <tr><td><strong>类型系统</strong></td><td>TypeScript</td><td>5.5.x</td><td>编译时类型检查</td></tr>
    <tr><td><strong>构建工具</strong></td><td>Vite</td><td>5.x</td><td>快速 HMR 和构建</td></tr>
    <tr><td><strong>样式</strong></td><td>Tailwind CSS</td><td>3.4.x</td><td>原子化 CSS 框架</td></tr>
    <tr><td><strong>状态管理</strong></td><td>TanStack Query</td><td>5.x</td><td>服务端状态缓存</td></tr>
    <tr><td><strong>代码编辑器</strong></td><td>Monaco Editor</td><td>4.6.x</td><td>VS Code 同款编辑器</td></tr>
    <tr><td><strong>金融图表</strong></td><td>Lightweight Charts</td><td>5.2.x</td><td>TradingView K线图</td></tr>
    <tr><td><strong>统计图表</strong></td><td>Recharts</td><td>2.12.x</td><td>响应式统计图表</td></tr>
  </tbody>
</table>

<h2 id="data-flow">数据流</h2>

<h3 id="rest-api-flow">REST API 数据流</h3>

<ol>
  <li><strong>React 组件</strong>调用 <code>useQuery()</code> hook</li>
  <li><strong>TanStack Query</strong> 发起 HTTP 请求到 <code>http://127.0.0.1:8080/api/v1/...</code></li>
  <li><strong>Freqtrade API Server</strong> 处理请求并返回 JSON</li>
  <li><strong>TanStack Query</strong> 缓存响应数据并触发组件重渲染</li>
</ol>

<h3 id="websocket-flow">WebSocket 实时数据流</h3>

<ol>
  <li><strong>FreqtradeWebSocket</strong> 类建立 WebSocket 连接</li>
  <li>通过 <code>subscribe()</code> 订阅特定消息类型</li>
  <li>服务器推送实时消息（交易入场、出场、价格更新等）</li>
  <li><strong>dispatch()</strong> 将消息路由到对应的处理器</li>
  <li>React 组件通过 <code>useWebSocket()</code> hook 获取实时数据</li>
</ol>

<h3 id="ipc-flow">IPC 主进程通信</h3>

<ol>
  <li><strong>渲染进程</strong>调用 <code>window.electronAPI.*</code> 方法</li>
  <li><strong>Preload 脚本</strong>通过 <code>contextBridge</code> 安全转发到 <code>ipcRenderer</code></li>
  <li><strong>主进程</strong>的 <code>ipcMain.handle()</code> 处理具体逻辑</li>
  <li>结果通过 Promise 返回给渲染进程</li>
</ol>

<h2 id="security">安全设计</h2>

<ul>
  <li><strong>Context Isolation</strong>: 渲染进程和主进程完全隔离</li>
  <li><strong>Preload 脚本</strong>: 只暴露安全的 API 方法，不直接暴露 <code>ipcRenderer</code></li>
  <li><strong>路径沙箱</strong>: 生产环境使用 <code>app.getPath('userData')</code> 限制文件访问</li>
  <li><strong>单实例锁</strong>: 防止多开导致的数据冲突</li>
</ul>

<h2 id="project-structure">项目结构</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">目录结构</span></div><pre><code>desktop/
├── electron/                  # Electron 主进程
│   ├── main.ts                # 主进程入口 (19KB)
│   └── preload.ts             # 安全预加载脚本
├── src/
│   ├── components/            # 可复用 UI 组件
???   │   ├── charts/            # 图表组件
│   │   ├── editor/            # 策略编辑器
│   │   ├── layout/            # 布局组件
│   │   └── trading/           # 交易操作组件
│   ├── hooks/                 # React Hooks
│   ├── lib/                   # 工具库
│   │   ├── api.ts             # REST API 客户端
│   │   ├── websocket.ts       # WebSocket 管理器
│   │   └── utils.ts           # 通用工具函数
│   ├── pages/                 # 页面级组件
│   ├── types/                 # TypeScript 类型定义
│   ├── App.tsx                # 根组件
│   └── main.tsx               # 入口文件
├── public/                    # 静态资源
├── package.json               # 项目配置
└── vite.config.ts             # Vite 构建配置</code></pre></div>

<h2 id="routing">路由策略</h2>

<p>应用采用 <strong>Tab 路由</strong>而非传统的 URL 路由。所有页面通过 <code>activeTab</code> 状态控制切换，使用 <code>React.lazy()</code> 实现代码分割和懒加载。</p>

<table>
  <thead>
    <tr><th>Tab ID</th><th>组件</th><th>描述</th></tr>
  </thead>
  <tbody>
    <tr><td><code>dashboard</code></td><td>Dashboard</td><td>交易仪表盘</td></tr>
    <tr><td><code>trades</code></td><td>TradesPage</td><td>交易记录列表</td></tr>
    <tr><td><code>backtest</code></td><td>BacktestPage</td><td>回测中心</td></tr>
    <tr><td><code>hyperopt</code></td><td>HyperoptPage</td><td>超参数优化</td></tr>
    <tr><td><code>strategy</code></td><td>StrategyPage</td><td>策略管理</td></tr>
    <tr><td><code>config</code></td><td>ConfigEditor</td><td>配置编辑器</td></tr>
    <tr><td><code>candles</code></td><td>Candles</td><td>K线图表</td></tr>
    <tr><td><code>data</code></td><td>DataDownload</td><td>数据下载</td></tr>
    <tr><td><code>logs</code></td><td>LogViewer</td><td>日志查看器</td></tr>
    <tr><td><code>trade-detail</code></td><td>TradeDetail</td><td>交易详情</td></tr>
    <tr><td><code>management</code></td><td>ManagementPage</td><td>交易管理</td></tr>
  </tbody>
</table>
