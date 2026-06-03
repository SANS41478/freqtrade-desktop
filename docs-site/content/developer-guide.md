开发者指南
developer-guide
<div class="page-header">
  <span class="badge badge-warning">开发与部署</span>
  <h1 id="developer-guide">开发者指南</h1>
  <p class="page-description">参与 Freqtrade Desktop 开发的完整指南。</p>
</div>

<h2 id="setup">开发环境搭建</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">bash</span></div><pre><code># 克隆仓库
git clone https://github.com/SANS41478/freqtrade-desktop.git
cd freqtrade-desktop/desktop

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动 Electron 开发模式（带热重载）
npm run electron:dev</code></pre></div>

<h2 id="project-structure">项目结构</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">目录结构</span></div><pre><code>desktop/
├── electron/
│   ├── main.ts              # Electron 主进程
│   └── preload.ts            # 安全预加载脚本
├── src/
│   ├── components/           # 可复用组件
│   │   ├── charts/           # 图表组件
│   │   ├── editor/           # 编辑器组件
│   │   ├── layout/           # 布局组件
│   │   └── trading/          # 交易组件
│   ├── hooks/                # React Hooks
│   ├── lib/                  # 工具库
│   │   ├── api.ts            # API 客户端
│   │   ├── websocket.ts      # WebSocket 管理
│   │   └── utils.ts          # 工具函数
│   ├── pages/                # 页面组件
│   ├── types/                # TypeScript 类型
│   ├── App.tsx               # 根组件
│   └── main.tsx              # 入口
├── package.json
├── tsconfig.json
└── vite.config.ts</code></pre></div>

<h2 id="coding-conventions">编码规范</h2>

<h3 id="typescript">TypeScript</h3>
<ul>
  <li>所有组件使用 TypeScript 编写</li>
  <li>使用接口定义 props 类型</li>
  <li>避免使用 <code>any</code> 类型</li>
  <li>API 响应类型定义在 <code>src/types/freqtrade.ts</code></li>
</ul>

<h3 id="components">React 组件</h3>
<ul>
  <li>函数组件 + Hooks</li>
  <li>使用 <code>React.memo()</code> 优化频繁渲染的组件</li>
  <li>大型组件拆分为更小的子组件</li>
  <li>使用 TanStack Query 管理服务端状态</li>
</ul>

<h3 id="styling">样式</h3>
<ul>
  <li>使用 Tailwind CSS 原子类</li>
  <li>颜色使用 CSS 变量（如 <code>var(--color-primary)</code>）</li>
  <li>使用 <code>cn()</code> 工具函数合并类名</li>
</ul>

<h3 id="api-calls">API 调用</h3>
<ul>
  <li>统一通过 <code>src/lib/api.ts</code> 发起请求</li>
  <li>使用 TanStack Query 的 <code>useQuery</code> / <code>useMutation</code></li>
  <li>配置合理的 <code>refetchInterval</code></li>
</ul>

<h2 id="testing">测试</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">bash</span></div><pre><code># 类型检查
npm run lint

# 构建测试
npm run build</code></pre></div>

<h2 id="contributing">贡献流程</h2>

<ol>
  <li>Fork 项目仓库</li>
  <li>创建功能分支: <code>git checkout -b feature/my-feature</code></li>
  <li>编写代码并确保 <code>npm run lint</code> 通过</li>
  <li>提交更改: <code>git commit -m "feat: add my feature"</code></li>
  <li>推送分支: <code>git push origin feature/my-feature</code></li>
  <li>创建 Pull Request</li>
</ol>

<h3 id="commit-convention">提交规范</h3>
<p>遵循 Conventional Commits 规范：</p>
<ul>
  <li><code>feat:</code> 新功能</li>
  <li><code>fix:</code> Bug 修复</li>
  <li><code>docs:</code> 文档更新</li>
  <li><code>style:</code> 代码格式（不影响功能）</li>
  <li><code>refactor:</code> 重构</li>
  <li><code>perf:</code> 性能优化</li>
  <li><code>chore:</code> 构建/工具变更</li>
</ul>
