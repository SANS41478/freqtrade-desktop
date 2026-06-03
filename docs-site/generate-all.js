var fs = require("fs");
var p = require("path");
var D = "F:/freqtrade/freqtrade/desktop/docs-site";

function w(f, c) {
  var fp = p.join(D, f);
  fs.mkdirSync(p.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, c, "utf8");
  console.log("  wrote: " + f + " (" + c.length + " bytes)");
}

function side(activePage) {
  var items = [
    ["../index.html","home","概览","开始使用",""],
    ["quickstart.html","quickstart","快速开始","开始使用",""],
    ["installation.html","installation","安装指南","开始使用",""],
    ["architecture.html","architecture","架构概览","功能模块",""],
    ["dashboard.html","dashboard","交易仪表盘","功能模块",""],
    ["trades.html","trades","交易管理","功能模块",""],
    ["backtest.html","backtest","回测中心","功能模块",""],
    ["hyperopt.html","hyperopt","超参数优化","功能模块",""],
    ["strategy.html","strategy","策略管理","功能模块",""],
    ["config.html","config","配置编辑器","功能模块",""],
    ["candles.html","candles","K线图表","功能模块",""],
    ["data.html","data","数据下载","功能模块",""],
    ["logs.html","logs","日志查看器","功能模块",""],
    ["api-reference.html","api-reference","API 参考","技术参考",""],
    ["websocket.html","websocket","WebSocket 协议","技术参考",""],
    ["keyboard-shortcuts.html","keyboard-shortcuts","快捷键","技术参考",""],
    ["developer-guide.html","developer-guide","开发者指南","开发与部署",""],
    ["deployment.html","deployment","部署指南","开发与部署",""],
    ["troubleshooting.html","troubleshooting","故障排除","开发与部署",""],
    ["changelog.html","changelog","更新日志","开发与部署",""]
  ];
  var sections = {};
  items.forEach(function(it) {
    if (!sections[it[3]]) sections[it[3]] = [];
    sections[it[3]].push(it);
  });
  var navIcons = {
    "home":"<path d=\"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/>",
    "quickstart":"<polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/>",
    "installation":"<path d=\"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/>",
    "architecture":"<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/>",
    "dashboard":"<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/>",
    "trades":"<polyline points=\"22 12 18 12 15 21 9 3 6 12 2 12\"/>",
    "backtest":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>",
    "hyperopt":"<polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/>",
    "strategy":"<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>",
    "config":"<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z\"/>",
    "candles":"<path d=\"M18 20V10M12 20V4M6 20v-6\"/>",
    "data":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3\"/><path d=\"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5\"/>",
    "logs":"<path d=\"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/>",
    "api-reference":"<path d=\"M4 19.5A2.5 2.5 0 016.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z\"/>",
    "websocket":"<path d=\"M12 2L2 7l10 5 10-5-10-5z\"/><path d=\"M2 17l10 5 10-5\"/><path d=\"M2 12l10 5 10-5\"/>",
    "keyboard-shortcuts":"<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/><path d=\"M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10\"/>",
    "developer-guide":"<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>",
    "deployment":"<path d=\"M22 11.08V12a10 10 0 11-5.93-9.14\"/><polyline points=\"22 4 12 14.01 9 11.01\"/>",
    "troubleshooting":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"/>",
    "changelog":"<path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z\"/>"
  };
  var sectionTitles = {"开始使用":"开始使用","功能模块":"功能模块","技术参考":"技术参考","开发与部署":"开发与部署"};
  var html = '';
  Object.keys(sections).forEach(function(sec) {
    html += '<div class="nav-section"><div class="nav-section-title">' + sectionTitles[sec] + '</div>\n';
    sections[sec].forEach(function(it) {
      var cls = it[1] === activePage ? ' active' : '';
      html += '<a href="' + it[0] + '" class="nav-item' + cls + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + navIcons[it[1]] + '</svg>' + it[2] + '</a>\n';
    });
    html += '</div>\n';
  });
  return html;
}

function wrap(title, activePage, body) {
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>' + title + ' - Freqtrade Desktop</title>\n<link rel="stylesheet" href="../css/style.css">\n<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'><rect width=\'32\' height=\'32\' rx=\'6\' fill=\'%23f97316\'/><text x=\'16\' y=\'22\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial\' font-weight=\'bold\' font-size=\'18\'>F</text></svg>">\n</head>\n<body>\n<div class="app">\n<header class="topbar"><div class="topbar-left"><button class="menu-toggle" onclick="toggleSidebar()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><a href="../index.html" class="topbar-brand"><span class="brand-icon">F</span><span class="brand-text">Freqtrade Desktop</span><span class="brand-version">v0.1.0</span></a></div><div class="topbar-center"><div class="search-wrapper"><svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="searchInput" class="search-input" placeholder="搜索文档... (Ctrl+K)" autocomplete="off"><div id="searchResults" class="search-results"></div></div></div><div class="topbar-right"><a href="https://github.com/SANS41478/freqtrade-desktop" class="topbar-link" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg><span>GitHub</span></a></div></header>\n<div class="layout">\n<aside class="sidebar" id="sidebar"><nav class="sidebar-nav">\n' + side(activePage) + '\n</nav></aside>\n<main class="main-content" id="mainContent"><div class="content-wrapper"><div class="doc-content">\n' + body + '\n</div>\n<footer class="doc-footer"><div class="footer-links"><a href="../index.html">概览</a><a href="https://github.com/SANS41478/freqtrade-desktop">GitHub</a><a href="changelog.html">更新日志</a></div><p class="footer-copy">&copy; 2026 Freqtrade Desktop &middot; 基于 GPL-3.0 许可证</p></footer>\n</div></main>\n<aside class="toc" id="toc"><div class="toc-title">本页目录</div><nav class="toc-nav" id="tocNav"></nav></aside>\n</div></div>\n<script src="../js/app.js"></script>\n</body></html>';
}

// Read all content files
var contentDir = p.join(D, "content");
var files = fs.readdirSync(contentDir);
files.forEach(function(f) {
  if (f.endsWith(".md")) {
    var content = fs.readFileSync(p.join(contentDir, f), "utf8");
    // Parse: first line = title, second line = activePage, rest = body
    var lines = content.split("\n");
    var title = lines[0];
    var active = lines[1];
    var body = lines.slice(2).join("\n");
    var filename = f.replace(".md", ".html");
    w("pages/" + filename, wrap(title, active, body));
  }
});
console.log("Done generating all pages.");