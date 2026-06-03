策略管理
strategy
<div class="page-header">
  <span class="badge badge-primary">功能模块</span>
  <h1 id="strategy">策略管理</h1>
  <p class="page-description">创建、查看和编辑交易策略，内置 Monaco Editor 提供专业编码体验。</p>
</div>

<h2 id="overview">概述</h2>
<p>策略管理页面让用户直接在桌面应用中编写和管理 Freqtrade 策略文件（Python），无需切换到外部 IDE。</p>

<h2 id="strategy-list">策略列表</h2>
<p>以卡片形式展示所有可用策略，显示策略名称、时间框架和类型。支持的操作：</p>
<ul>
  <li><strong>查看详情</strong>: 点击卡片展开策略详情面板</li>
  <li><strong>编辑代码</strong>: 悬停显示编辑按钮，打开 Monaco Editor</li>
  <li><strong>新建策略</strong>: 从空白或模板创建新策略</li>
</ul>

<h2 id="strategy-detail">策略详情</h2>
<p>展开后显示策略的完整信息：</p>
<ul>
  <li>策略名称和时间框架</li>
  <li>参数列表（名称、类型、空间、当前值、范围）</li>
  <li>可优化参数标记</li>
</ul>

<h2 id="editor">Monaco Editor 编辑器</h2>
<p>内置的代码编辑器提供以下特性：</p>
<ul>
  <li><strong>Python 语法高亮</strong>: 自动识别 Python 关键字和 Freqtrade API</li>
  <li><strong>代码自动补全</strong>: 策略接口方法提示</li>
  <li><strong>错误检查</strong>: 实时语法错误标注</li>
  <li><strong>一键保存</strong>: Ctrl+S 快速保存到文件系统</li>
  <li><strong>模板创建</strong>: 内置标准策略模板</li>
</ul>

<h2 id="template">策略模板</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">Python</span></div><pre><code>from freqtrade.strategy import IStrategy
import talib.abstract as ta
import pandas as pd

class MyStrategy(IStrategy):
    INTERFACE_VERSION = 3
    timeframe = '5m'
    can_short = False
    minimal_roi = {"0": 0.01, "60": 0.02, "1440": 0.05}
    stoploss = -0.10
    trailing_stop = True

    def populate_indicators(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        dataframe['ema_short'] = ta.EMA(dataframe, timeperiod=12)
        dataframe['ema_long'] = ta.EMA(dataframe, timeperiod=26)
        return dataframe

    def populate_entry_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe.loc[
            (dataframe['rsi'] < 30) &amp; (dataframe['ema_short'] > dataframe['ema_long']),
            'enter_long'
        ] = 1
        return dataframe

    def populate_exit_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe.loc[dataframe['rsi'] > 70, 'exit_long'] = 1
        return dataframe</code></pre></div>

<h2 id="file-system">文件系统</h2>
<p>策略文件通过 Electron IPC 直接读写 <code>user_data/strategies/</code> 目录，无需经过 Freqtrade API。</p>

<table>
  <thead>
    <tr><th>操作</th><th>IPC 调用</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td>列出策略</td><td><code>strategy:list</code></td><td>扫描 strategies 目录</td></tr>
    <tr><td>读取策略</td><td><code>strategy:read</code></td><td>读取 .py 文件内容</td></tr>
    <tr><td>保存策略</td><td><code>strategy:write</code></td><td>写入 .py 文件</td></tr>
    <tr><td>创建策略</td><td><code>strategy:create</code></td><td>从模板创建新文件</td></tr>
  </tbody>
</table>
