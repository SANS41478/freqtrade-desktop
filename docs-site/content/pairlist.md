浜や槗瀵瑰垪琛?pairlist
<div class="page-header">
  <span class="badge badge-primary">鍔熻兘妯″潡</span>
  <h1 id="pairlist">浜や槗瀵瑰垪琛＄</h1>
  <p class="page-description">閰嶇疆鍜岃涓&amp;#x4F30;&#x4EF7; Pairlist &#x8FC7;&#x6EE4;&#x5668;&#x94FE;&#xFF0C;&#x751F;&#x6210;&#x4EA4;&#x6613;&#x5BF9;&#x767D;&#x540D;&#x5355;&#x3002;</p>
</div>

<h2 id="overview">姒傝堪</h2>
<p>Pairlist &#x7BA1;&#x7406;&#x9875;&#x9762;&#x5141;&#x8BB8;&#x4F60;&#x914D;&#x7F6E; Freqtrade &#x7684;&#x4EA4;&#x6613;&#x5BF9;&#x8FC7;&#x6EE4;&#x5668;&#x94FE;&#x3002;&#x8FC7;&#x6EE4;&#x5668;&#x6309;&#x987A;&#x5E8F;&#x6267;&#x884C;&#xFF0C;&#x6700;&#x7EC8;&#x8F93;&#x51FA;&#x767D;&#x540D;&#x5355;&#x3002;</p>

<h2 id="features">鍔熻兘</h2>

<h3 id="available">&#x53EF;&#x7528;&#x8FC7;&#x6EE4;&#x5668;</h3>
<p>&#x4ECE; <code>/api/v1/pairlists/available</code> &#x52A0;&#x8F7D;&#x6240;&#x6709;&#x53EF;&#x7528;&#x7684;&#x8FC7;&#x6EE4;&#x5668;&#xFF0C;&#x5305;&#x62EC;&#xFF1A;</p>
<ul>
  <li><strong>VolumePairList</strong>: &#x6309;&#x6210;&#x4EA4;&#x91CF;&#x6392;&#x5E8F;</li>
  <li><strong>StaticPairList</strong>: &#x9759;&#x6001;&#x56FA;&#x5B9A;&#x5217;&#x8868;</li>
  <li><strong>AgeFilter</strong>: &#x4E0A;&#x5E02;&#x65F6;&#x95F4;&#x8FC7;&#x6EE4;</li>
  <li><strong>SpreadFilter</strong>:;&#x4E76;&#x5DEE;&#x8FC7;&#x6EE4;</li>
  <li><strong>PriceFilter</strong>: &#x4EF7;&#x683C;&#x8FC7;&#x6EE4;</li>
  <li>&#x66F4;&#x591A;...&#xFF08;&#x53D6;&#x51B3;&#x4E8E;&#x5B89;&#x88C5;&#x7684;&#x63D2;&#x4EF6;&#xFF09;</li>
</ul>

<h3 id="chain">&#x8FC7;&#x6EE4;&#x5668;&#x94FE;&#x914D;&#x7F6E;</h3>
<p>&#x5728;&#x53F3;&#x4FA7;&#x9762;&#x677F;&#x914D;&#x7F6E;&#x5F53;&#x524D;&#x94FE;&#xFF1A;</p>
<ul>
  <li>&#x62D6;&#x62FD;&#x6392;&#x5E8F;&#x8FC7;&#x6EE4;&#x5668;&#x6267;&#x884C;&#x987A;&#x5E8F;</li>
  <li>&#x70B9;&#x51FB; &#x201C;&#x79FB;&#x9664;&#x201D; &#x79FB;&#x9664;&#x4E0D;&#x9700;&#x8981;&#x7684;&#x8FC7;&#x6EE4;&#x5668;</li>
</ul>

<h3 id="evaluate">&#x8BC4;&#x4F30;</h3>
<p>&#x70B9;&#x51FB; &#x201C;&#x8BC4;&#x4F30;&#x201D; &#x6309;&#x94AE;&#x8C03;&#x7528; <code>/api/v1/pairlists/evaluate</code> &#x751F;&#x6210;&#x767D;&#x540D;&#x5355;&#xFF0C;&#x7ED3;&#x679C;&#x5728;&#x4E0B;&#x65B9;&#x5C55;&#x793A;&#x3002;</p>

<h2 id="api">&#x76F8;&#x5173; API</h2>
<table>
  <thead><tr><th>&#x7AEF;&#x70B9;</th><th>&#x65B9;&#x6CD5;</th><th>&#x8BF4;&#x660E;</th></tr></thead>
  <tbody>
    <tr><td><code>/api/v1/pairlists/available</code></td><td>GET</td><td>&#x53EF;&#x7528;&#x8FC7;&#x6EE4;&#x5668;&#x5217;&#x8868;</td></tr>
    <tr><td><code>/api/v1/pairlists/evaluate</code></td><td>POST</td><td>&#x6267;&#x884C;&#x8FC7;&#x6EE4;&#x5668;&#x94FE;&#x8BC4;&#x4F30;</td></tr>
  </tbody>
</table>
