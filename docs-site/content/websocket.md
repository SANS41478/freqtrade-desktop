WebSocket 协议
websocket
<div class="page-header">
  <span class="badge badge-info">技术参考</span>
  <h1 id="websocket">WebSocket 协议</h1>
  <p class="page-description">Freqtrade WebSocket 实时通信协议详解。</p>
</div>

<h2 id="connection">连接信息</h2>

<table>
  <thead>
    <tr><th>配置项</th><th>值</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>URL</strong></td><td><code>ws://127.0.0.1:8080/api/v1/message/ws</code></td></tr>
    <tr><td><strong>认证</strong></td><td>URL 参数 <code>?token=xxx</code></td></tr>
    <tr><td><strong>格式</strong></td><td>JSON</td></tr>
  </tbody>
</table>

<h2 id="client">FreqtradeWebSocket 客户端</h2>

<p>桌面应用内置了 <code>FreqtradeWebSocket</code> 类，封装了以下功能：</p>

<ul>
  <li><strong>自动重连</strong>: 指数退避策略，初始 1 秒，最大 30 秒</li>
  <li><strong>消息路由</strong>: 按消息类型分发到订阅者</li>
  <li><strong>重订阅</strong>: 重连后自动重新订阅</li>
  <li><strong>连接监听</strong>: 外部可监听连接状态变化</li>
</ul>

<h2 id="message-types">消息类型</h2>

<table>
  <thead>
    <tr><th>类型</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>status</code></td><td>状态消息</td></tr>
    <tr><td><code>warning</code></td><td>警告消息</td></tr>
    <tr><td><code>exception</code></td><td>异常消息</td></tr>
    <tr><td><code>startup</code></td><td>启动消息</td></tr>
    <tr><td><code>entry</code></td><td>入场信号</td></tr>
    <tr><td><code>entry_fill</code></td><td>入场成交</td></tr>
    <tr><td><code>entry_cancel</code></td><td>入场取消</td></tr>
    <tr><td><code>exit</code></td><td>出场信号</td></tr>
    <tr><td><code>exit_fill</code></td><td>出场成交</td></tr>
    <tr><td><code>exit_cancel</code></td><td>出场取消</td></tr>
    <tr><td><code>protection_trigger</code></td><td>保护触发</td></tr>
    <tr><td><code>strategy_msg</code></td><td>策略消息</td></tr>
    <tr><td><code>whitelist</code></td><td>白名单更新</td></tr>
    <tr><td><code>analyzed_df</code></td><td>数据分析完成</td></tr>
    <tr><td><code>new_candle</code></td><td>新K线</td></tr>
  </tbody>
</table>

<h2 id="subscribe">订阅机制</h2>

<div class="code-block"><div class="code-header"><span class="code-lang">JavaScript</span></div><pre><code>// 发送订阅请求
ws.send(JSON.stringify({
  type: 'subscribe',
  data: ['entry', 'exit', 'status']
}));

// 接收消息
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  // msg.type: 消息类型
  // msg.data: 消息数据
};</code></pre></div>

<h2 id="api">客户端 API</h2>

<table>
  <thead>
    <tr><th>方法</th><th>参数</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>connect()</code></td><td>-</td><td>建立连接</td></tr>
    <tr><td><code>disconnect()</code></td><td>-</td><td>断开连接</td></tr>
    <tr><td><code>subscribe(types)</code></td><td>消息类型数组</td><td>订阅消息</td></tr>
    <tr><td><code>on(type, handler)</code></td><td>类型 + 回调</td><td>监听特定消息</td></tr>
    <tr><td><code>onAny(handler)</code></td><td>回调</td><td>监听所有消息</td></tr>
    <tr><td><code>onConnection(handler)</code></td><td>回调</td><td>监听连接状态</td></tr>
  </tbody>
</table>
