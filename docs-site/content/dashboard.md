浜や槗浠〃鐩?dashboard
<div class="page-header">
  <span class="badge badge-primary">鍔熻兘妯″潡</span>
  <h1 id="dashboard">浜や槗浠〃鐩?</h1>
  <p class="page-description">瀹炴椂鐩戞帶浜や槗鐘舵€併€佽处鎴蜂綑棰濄€佹敹鐩婃洸绾垮拰鎸佷粨鎯呭喌銆?/p>
</div>

<h2 id="overview">姒傝堪</h2>
<p>浜や槗浠〃鐩樻槸 Freqtrade Desktop 鐨勯粯璁ら〉闈紝鎻愪緵浜や槗娲诲姩鐨勫叏闈㈠彲瑙嗗€笺傛墍鏈夋暟鎹&#x5C;閫氳繃 TanStack Query 鑷&#x5C;鍔╁姞杞&#x5C;&#xFF0C鎸佷粨鏁版嵁閫氳繃 WebSocket 瀹炴椂鏇存柊&#x3002</p>

<h2 id="status-bar">杩愮岀姷鎬佹爣璁?/h2>
<p>椤甸潰鍙充笂瑙掑疄鏃舵樉绀哄綋鍓嶆満鍣充汉鐘舵€侊細</p>
<ul>
  <li><strong>杩愯&#x884C;&#x4E2D;</strong> &#x2014; 練ョ暐鍣&#x5DF2;&#x542F;&#x52A8;</li>
  <li><strong>Dry-Run &#x6A21;&#x5F0F;</strong> &#x2014; 妞熷嫙浜や槗</li>
  <li><strong>鏈&#x672A;&#x8FDE;&#x63A5;</strong> &#x2014; API 鏈嶅姟鍣&#x672A;&#x53EF;&#x7528;</li>
</ul>
<p>&#x72B6;&#x6001;&#x4ECE; <code>/api/v1/health</code> &#x548C; <code>/api/v1/show_config</code> &#x5B9E;&#x65F6;&#x83B7;&#x53D6;&#x3002;&#x652F;&#x6301;&#x5728;&#x4FA7;&#x8FB9;&#x680F;&#x52A8;&#x6001;&#x663E;&#x793A; Dry-Run / Live &#x72B6;&#x6001;&#x3002;</p>

<h2 id="metrics">&#x6838;&#x5FC3;&#x6307;&#x6807;&#x5361;&#x7247;</h2>
<table>
  <thead>
    <tr><th>&#x6307;&#x6807;</th><th>&#x6570;&#x636E;&#x6E90;</th><th>&#x5237;&#x65B0;&#x9891;&#x7387;</th><th>&#x8BF4;&#x660E;</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>&#x603B;&#x6743;&#x76CA;</strong></td><td><code>/api/v1/balance</code></td><td>10 &#x79D2;</td><td>&#x8D26;&#x6237;&#x603B;&#x8D44;&#x4EA7;&#xFF08;&#x542B;&#x6301;&#x4ED3;&#x4F30;&#x503C;&#xFF09;</td></tr>
    <tr><td><strong>&#x6301;&#x4ED3;&#x4E2D;</strong></td><td><code>/api/v1/count</code></td><td>5 &#x79D2;</td><td>&#x5F53;&#x524D;&#x6301;&#x4ED3;&#x6570; / &#x6700;&#x5927;&#x5141;&#x8BB8;&#x6570;</td></tr>
    <tr><td><strong>&#x80DC;&#x7387;</strong></td><td><code>/api/v1/profit</code></td><td>30 &#x79D2;</td><td>&#x76C8;&#x5229;&#x4EA4;&#x6613;&#x5360;&#x6BD4;</td></tr>
    <tr><td><strong>&#x590F;&#x666E;&#x6BD4;&#x7387;</strong></td><td><code>/api/v1/profit</code></td><td>30 &#x79D2;</td><td>&#x98CE;&#x9669;&#x8C03;&#x6574;&#x6536;&#x76CA;&#x6307;&#x6807;</td></tr>
  </tbody>
</table>

<h2 id="sections">&#x9875;&#x9762;&#x533A;&#x57DF;</h2>

<h3 id="price-ticker">&#x5B9E;&#x65F6;&#x4EF7;&#x683C; Ticker</h3>
<p>&#x663E;&#x793A;&#x767D;&#x540D;&#x5355;&#x4E2D;&#x4EA4;&#x6613;&#x5BF9;&#x7684;&#x5B9E;&#x65F6;&#x4EF7;&#x683C;&#xFF0C;&#x901A;&#x8FC7; WebSocket &#x63A8;&#x9001;&#x3002;&#x652F;&#x6301; BTC/USDT&#x3001;ETH/USDT &#x7B49;&#x4E3B;&#x6D41;&#x4EA4;&#x6613;&#x5BF9;&#x3002;</p>

<h3 id="equity-chart">&#x6743;&#x76CA;&#x66F2;&#x7EBF;</h3>
<p>&#x57FA;&#x4E8E; Recharts &#x7684;&#x9762;&#x79EF;&#x56FE;&#xFF0C;&#x5C55;&#x793A;&#x6BCF;&#x65E5;&#x6536;&#x76CA;&#x53D8;&#x5316;&#x8D8B;&#x52BF;&#x3002;&#x6570;&#x636E;&#x6765;&#x81EA; <code>/api/v1/daily</code> &#x63A5;&#x53E3;&#x3002;</p>

<h3 id="sysinfo">&#x7CFB;&#x7EDF;&#x72B6;&#x6001;</h3>
<p>&#x663E;&#x793A;&#x670D;&#x52A1;&#x5668;&#x8D44;&#x6E90;&#x4F7F;&#x7528;&#x60C5;&#x51B5;&#xFF08;<code>/api/v1/sysinfo</code>&#xFF09;&#xFF1A;</p>
<ul>
  <li><strong>CPU &#x4F7F;&#x7528;&#x7387;</strong>: &#x8FDB;&#x5EA6;&#x6761;&#x5B9E;&#x65F6;&#x663E;&#x793A;</li>
  <li><strong>&#x5185;&#x5B58;</strong>: &#x5DF2;&#x7528;/&#x603B;&#x91CF; GB</li>
  <li><strong>&#x7B56;&#x7565;</strong>: &#x5F53;&#x524D;&#x8FD0;&#x884C;&#x7684;&#x7B56;&#x7565;&#x540D;&#x79F0;</li>
  <li><strong>&#x65F6;&#x95F4;&#x6846;&#x67B6;</strong>: &#x5F53;&#x524D;&#x4F7F;&#x7528;&#x7684; K&#x7EBF;&#x5468;&#x671F;</li>
  <li><strong>&#x4EA4;&#x6613;&#x6240;</strong>: &#x63D0;&#x4F9B;&#x6D41;&#x52A8;&#x7684;&#x4EA4;&#x6613;&#x6240;</li>
  <li><strong>&#x8FD0;&#x884C;&#x65F6;&#x957F;</strong>: &#x81EA;&#x542F;&#x52A8;&#x4EE5;&#x6765;&#x7684;&#x65F6;&#x95F4;</li>
</ul>

<h3 id="open-positions">&#x5F53;&#x524D;&#x6301;&#x4ED3;</h3>
<p>&#x663E;&#x793A;&#x6240;&#x6709;&#x672A;&#x5E73;&#x4ED3;&#x4EA4;&#x6613;&#xFF0C;&#x5305;&#x542B;&#x4EA4;&#x6613;&#x5BF9;&#x3001;&#x65B9;&#x5411;&#x3001;&#x76C8;&#x4E8F;&#x3001;&#x6536;&#x76CA;&#x7387;&#x7B49;&#x4FE1;&#x606F;&#x3002;&#x60AC;&#x505C;&#x65F6;&#x663E;&#x793A;&#x5F3A;&#x5236;&#x5E73;&#x4ED3;&#x6309;&#x94AE;&#x3002;&#x70B9;&#x51FB;&#x53EF;&#x8DF3;&#x8F6C;&#x4EA4;&#x6613;&#x8BE6;&#x60C5;&#x9875;&#x3002;</p>

<h3 id="force-entry">&#x5F3A;&#x5236;&#x5165;&#x573A;</h3>
<p>&#x5FEB;&#x901F;&#x5165;&#x573A;&#x8868;&#x5355;&#xFF0C;&#x652F;&#x6301;&#x4EE5;&#x4E0B;&#x53C2;&#x6570;&#xFF1A;</p>
<ul>
  <li><strong>&#x4EA4;&#x6613;&#x5BF9;</strong>: &#x5982; BTC/USDT</li>
  <li><strong>&#x65B9;&#x5411;</strong>: &#x591A;&#x5934; / &#x7A7A;&#x5934;</li>
  <li><strong>&#x8BA2;&#x5355;&#x7C7B;&#x578B;</strong>: &#x9650;&#x4EF7;&#x5355; / &#x5E02;&#x4EF7;&#x5355;</li>
  <li><strong>&#x5165;&#x573A;&#x4EF7;&#x683C;</strong>: &#x53EF;&#x9009;</li>
  <li><strong>&#x91D1;&#x989D;</strong>: &#x53EF;&#x9009;</li>
</ul>

<h3 id="performance">&#x4EA4;&#x6613;&#x5BF9;&#x7EE9;&#x6548;&#x540D;</h3>
<p>&#x5C55;&#x793A;&#x76C8;&#x5229;&#x6700;&#x591A;&#x548C;&#x4E8F;&#x635F;&#x6700;&#x591A;&#x7684;&#x4EA4;&#x6613;&#x5BF9;&#xFF0C;&#x5305;&#x542B;&#x4EA4;&#x6613;&#x7B14;&#x6570;&#x548C;&#x6536;&#x76CA;&#x7387;&#x3002;&#x6570;&#x636E;&#x6765;&#x81EA; <code>/api/v1/performance</code>&#x3002;</p>

<h3 id="entry-tags">&#x5165;&#x573A;&#x6807;&#x7B7E;&#x5206;&#x6790;</h3>
<p>&#x7EDF;&#x8BA1;&#x5404;&#x6807;&#x7B7E;&#x7684;&#x4EA4;&#x6613;&#x7B14;&#x6570;&#x548C;&#x6536;&#x76CA;&#x7387;&#x3002;&#x6570;&#x636E;&#x6765;&#x81EA; <code>/api/v1/entries</code>&#x3002;</p>

<h3 id="exit-reasons">&#x51FA;&#x573A;&#x539F;&#x56E0;&#x7EDF;&#x8BA1;</h3>
<p>&#x7EDF;&#x8BA1;&#x5404;&#x51FA;&#x573A;&#x539F;&#x56E0;&#x7684;&#x4EA4;&#x6613;&#x7B14;&#x6570;&#x548C;&#x76C8;&#x4E8F;&#x3002;&#x6570;&#x636E;&#x6765;&#x81EA; <code>/api/v1/exits</code>&#x3002;</p>

<h3 id="recent-trades">&#x6700;&#x8FD1;&#x6210;&#x4EA4;</h3>
<p>&#x6700;&#x8FD1; 5 &#x7B14;&#x5DF2;&#x5B8C;&#x6210;&#x4EA4;&#x6613;&#x7684;&#x5217;&#x8868;&#xFF0C;&#x5305;&#x542B;&#x4EA4;&#x6613;&#x5BF9;&#x3001;&#x65B9;&#x5411;&#x3001;&#x76C8;&#x4E8F;&#x3001;&#x6301;&#x4ED3;&#x65F6;&#x957F;&#x3002;&#x70B9;&#x51FB;&#x53EF;&#x8DF3;&#x8F6C;&#x4EA4;&#x6613;&#x8BE6;&#x60C5;&#x3002;</p>

<h3 id="weekly-monthly">&#x6BCF;&#x5468;/&#x6BCF;&#x6708;&#x6536;&#x76CA;</h3>
<p>&#x6536;&#x76CA;&#x7EDF;&#x8BA1;&#x8868;&#xFF0C;&#x5C55;&#x793A;&#x8FD1; 12 &#x4E2A;&#x5468;&#x671F;&#x7684;&#x6536;&#x76CA;&#x767E;&#x5206;&#x6BD4;&#x3002;</p>

<h2 id="api-endpoints">&#x76F8;&#x5173; API &#x7AEF;&#x70B9;</h2>
<table>
  <thead>
    <tr><th>&#x7AEF;&#x70B9;</th><th>&#x65B9;&#x6CD5;</th><th>&#x8BF4;&#x660E;</th></tr>
  </thead>
  <tbody>
    <tr><td><code>/api/v1/balance</code></td><td>GET</td><td>&#x8D26;&#x6237;&#x4F59;&#x989D;</td></tr>
    <tr><td><code>/api/v1/count</code></td><td>GET</td><td>&#x6301;&#x4ED3;&#x8BA1;&#x6570;</td></tr>
    <tr><td><code>/api/v1/profit</code></td><td>GET</td><td>&#x6536;&#x76CA;&#x7EDF;&#x8BA1;</td></tr>
    <tr><td><code>/api/v1/status</code></td><td>GET</td><td>&#x5F53;&#x524D;&#x6301;&#x4ED3;&#x72B6;&#x6001;</td></tr>
    <tr><td><code>/api/v1/daily</code></td><td>GET</td><td>&#x6BCF;&#x65E5;&#x6536;&#x76CA;</td></tr>
    <tr><td><code>/api/v1/health</code></td><td>GET</td><td>&#x5065;&#x5EB7;&#x68C0;&#x67E5;</td></tr>
    <tr><td><code>/api/v1/sysinfo</code></td><td>GET</td><td>&#x7CFB;&#x7EDF;&#x4FE1;&#x606F;</td></tr>
    <tr><td><code>/api/v1/performance</code></td><td>GET</td><td>&#x4EA4;&#x6613;&#x5BF9;&#x7EE9;&#x6548;</td></tr>
    <tr><td><code>/api/v1/entries</code></td><td>GET</td><td>&#x5165;&#x573A;&#x6807;&#x7B7E;&#x7EDF;&#x8BA1;</td></tr>
    <tr><td><code>/api/v1/exits</code></td><td>GET</td><td>&#x51FA;&#x573A;&#x539F;&#x56E0;&#x7EDF;&#x8BA1;</td></tr>
    <tr><td><code>/api/v1/forceenter</code></td><td>POST</td><td>&#x5F3A;&#x5236;&#x5165;&#x573A;</td></tr>
    <tr><td><code>/api/v1/forceexit</code></td><td>POST</td><td>&#x5F3A;&#x5236;&#x51FA;&#x573A;</td></tr>
  </tbody>
</table>
