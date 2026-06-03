更新日志 changelog
<div class="page-header">
  <span class="badge badge-warning">开发与部署</span>
  <h1 id="changelog">更新日志</h1>
  <p class="page-description">Freqtrade Desktop 的版本更新记录。</p>
</div>

<h2 id="v0-2-0">v0.2.0 <span class="badge badge-primary">最新</span></h2>
<p><em>2026-06-03</em></p>

<h3>新增功能</h3>
<ul>
  <li>Pairlist 管理 — 全新页面，可选过滤器、排序链、一键评估</li>
  <li>Trailing Stop 配置 — 新增跟踪止损配置分区</li>
  <li>Protection 配置 — 新增风控配置分区（布局模式、短仓允许、DCA 加仓）</li>
  <li>Dashboard 系统监控 — CPU/内存使用率、策略、时间框架、运行时长</li>
  <li>Dashboard 动态状态 — 运行/Dry-Run/未连接实时显示</li>
  <li>Trades 日期筛选 — 开始/结束日期过滤</li>
  <li>Trades 排序 — 交易对/盈亏/收益率/持仓时长可点击排序</li>
  <li>Hyperopt 历史删除 — 优化历史记录删除按钮</li>
  <li>LogViewer 自动刷新 — 5 秒间隔自动刷新（浏览器模式）</li>
  <li>ManagementPage 批量操作 — 批量删除锁定、自定义锁定时长（1h~7d）</li>
  <li>ManagementPage 白名单 — 白名单交易对只读展示</li>
  <li>Toast 通知 — 全局操作反馈提示系统</li>
  <li>Backtest 备注编辑 — 回测历史记录备注字段</li>
  <li>Backtest 市场变动 — 回测市场变化展示</li>
</ul>

<h3>改进</h3>
<ul>
  <li>ConfigData 扩展 — 新增 trailing/protection 相关字段</li>
  <li>Sidebar 动态状态 — Dry-Run/Live 指示器动态变化</li>
  <li>Strategy 真实 Timeframe — 从 API 获取策略时间框架</li>
</ul>

<h2 id="v0-1-0">v0.1.0</h2>
<p><em>2026-06-01</em></p>

<h3>初始发布</h3>
<ul>
  <li>实时交易仪表盘</li>
  <li>交易管理（筛选、排序、CSV 导出）</li>
  <li>K线图表</li>
  <li>回测中心（可视化、对比分析）</li>
  <li>超参数优化</li>
  <li>策略管理（Monaco Editor）</li>
  <li>配置编辑器（6 个分区）</li>
  <li>数据下载</li>
  <li>日志查看器</li>
  <li>系统托盘</li>
  <li>桌面通知</li>
</ul>

<h3>技术特性</h3>
<ul>
  <li>Electron 31 + React 18 + TypeScript 5.5</li>
  <li>Vite 5 + Tailwind CSS</li>
  <li>TanStack Query + WebSocket</li>
  <li>Monaco Editor + Recharts</li>
  <li>GPL-3.0 许可证</li>
</ul>