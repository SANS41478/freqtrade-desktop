超参数优化
hyperopt
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="hyperopt">超参数优化</h1>
  <p class="page-description">使用 Optuna 自动优化策略参数，找到最优的交易配置。</p>
</div>

<h2 id="overview">概述</h2>
<p>超参数优化页面封装了 Freqtrade 的 Hyperopt 功能，通过 Optuna 贝叶斯优化算法自动搜索最优策略参数组合。</p>

<h2 id="configuration">配置参数</h2>

<table>
  <thead>
    <tr><th>参数</th><th>类型</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>策略</strong></td><td>下拉选择</td><td>选择要优化的策略</td></tr>
    <tr><td><strong>优化轮数</strong></td><td>数字输入</td><td>总迭代次数 (epochs)</td></tr>
    <tr><td><strong>优化空间</strong></td><td>复选框</td><td>buy / sell / roi / stoploss / trailing</td></tr>
    <tr><td><strong>损失函数</strong></td><td>下拉选择</td><td>SharpeHyperOptLossDaily 等</td></tr>
    <tr><td><strong>时间范围</strong></td><td>文本输入</td><td>训练数据时间范围</td></tr>
    <tr><td><strong>并行任务</strong></td><td>数字输入</td><td>并行运行的 worker 数量</td></tr>
  </tbody>
</table>

<h2 id="optimization-spaces">优化空间</h2>

<ul>
  <li><strong>buy</strong>: 买入信号参数（RSI 阈值、EMA 周期等）</li>
  <li><strong>sell</strong>: 卖出信号参数</li>
  <li><strong>roi</strong>: 最小 ROI 表（分阶段止盈）</li>
  <li><strong>stoploss</strong>: 止损比例</li>
  <li><strong>trailing</strong>: 追踪止损参数</li>
</ul>

<h2 id="progress">实时进度</h2>
<p>运行过程中显示：</p>
<ul>
  <li>当前轮次 / 总轮次</li>
  <li>进度条百分比</li>
  <li>当前最优损失值</li>
</ul>

<h2 id="loss-functions">损失函数</h2>

<table>
  <thead>
    <tr><th>函数</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>SharpeHyperOptLossDaily</code></td><td>基于日收益的夏普比率（推荐）</td></tr>
    <tr><td><code>SharpeHyperOptLoss</code></td><td>基于交易的夏普比率</td></tr>
    <tr><td><code>SortinoHyperOptLossDaily</code></td><td>基于日收益的索提诺比率</td></tr>
    <tr><td><code>CalmarHyperOptLoss</code></td><td>Calmar 比率</td></tr>
    <tr><td><code>MaxDrawDownHyperOptLoss</code></td><td>最小化最大回撤</td></tr>
    <tr><td><code>OnlyProfitHyperOptLoss</code></td><td>仅优化利润</td></tr>
  </tbody>
</table>

<h2 id="history">历史记录</h2>
<p>所有优化运行自动保存。可以查看历史优化结果、比较不同运行的表现。</p>
