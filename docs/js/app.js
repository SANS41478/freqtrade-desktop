(function(){
  // Sidebar toggle
  window.toggleSidebar = function(){
    document.getElementById('sidebar').classList.toggle('open');
  };

  // Active nav item
  var currentPage = document.querySelector('.nav-item.active');
  if(!currentPage){
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(function(el){
      var href = el.getAttribute('href');
      if(href && href.indexOf(path) !== -1) el.classList.add('active');
    });
  }

  // TOC generation
  var tocNav = document.getElementById('tocNav');
  if(tocNav){
    var headings = document.querySelectorAll('.doc-content h2, .doc-content h3');
    headings.forEach(function(h){
      if(!h.id){
        h.id = h.textContent.replace(/[^\w\u4e00-\u9fff]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
      }
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.className = h.tagName === 'H3' ? 'depth-3' : '';
      tocNav.appendChild(a);
    });

    // Scroll spy
    var mainEl = document.getElementById('mainContent');
    if(mainEl){
      mainEl.addEventListener('scroll', function(){
        var scrollPos = mainEl.scrollTop + 100;
        var active = null;
        headings.forEach(function(h){
          if(h.offsetTop <= scrollPos) active = h;
        });
        tocNav.querySelectorAll('a').forEach(function(a){
          a.classList.remove('active');
          if(active && a.getAttribute('href') === '#' + active.id){
            a.classList.add('active');
          }
        });
      });
    }
  }

  // Copy code blocks
  document.querySelectorAll('.code-block').forEach(function(block){
    var header = block.querySelector('.code-header');
    if(!header) return;
    var btn = document.createElement('button');
    btn.className = 'code-copy';
    btn.textContent = '复制';
    btn.onclick = function(){
      var code = block.querySelector('pre').textContent;
      navigator.clipboard.writeText(code).then(function(){
        btn.textContent = '已复制!';
        setTimeout(function(){ btn.textContent = '复制'; }, 2000);
      });
    };
    header.appendChild(btn);
  });

  // Search
  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  if(!searchInput || !searchResults) return;

  var pages = [
    {title:'概览',section:'开始使用',url:'../index.html',keywords:'home overview 首页 概览 介绍'},
    {title:'快速开始',section:'开始���用',url:'quickstart.html',keywords:'quick start 安装 启动 入门 快速'},
    {title:'安装指南',section:'开始使用',url:'installation.html',keywords:'install npm node 依赖 安装'},
    {title:'架构概览',section:'功能模块',url:'architecture.html',keywords:'architecture 架构 设计 技术栈'},
    {title:'交易仪表盘',section:'功能模块',url:'dashboard.html',keywords:'dashboard 仪表盘 监控 余额'},
    {title:'交易管理',section:'功能模块',url:'trades.html',keywords:'trades 交易 记录 筛选'},
    {title:'回测中心',section:'功能模块',url:'backtest.html',keywords:'backtest 回测 策略 对比'},
    {title:'超参数优化',section:'功能模块',url:'hyperopt.html',keywords:'hyperopt 超参数 优化 optuna'},
    {title:'策略管理',section:'功能模块',url:'strategy.html',keywords:'strategy 策略 编辑 monaco'},
    {title:'配置编辑器',section:'功能模块',url:'config.html',keywords:'config 配置 设置 json'},
    {title:'K线图表',section:'功能模块',url:'candles.html',keywords:'candles k线 蜡烛图'},
    {title:'数据下载',section:'功能模块',url:'data.html',keywords:'data 数据 下载 ohlcv'},
    {title:'日志查看器',section:'功能模块',url:'logs.html',keywords:'logs 日志 console'},
    {title:'API 参考',section:'技术参考',url:'api-reference.html',keywords:'api rest http'},
    {title:'WebSocket 协议',section:'技术参考',url:'websocket.html',keywords:'websocket ws 实时'},
    {title:'快捷键',section:'技术参考',url:'keyboard-shortcuts.html',keywords:'keyboard shortcuts 快捷键'},
    {title:'开发者指南',section:'开发与部署',url:'developer-guide.html',keywords:'developer 开发 贡献'},
    {title:'部署指南',section:'开发与部署',url:'deployment.html',keywords:'deploy 部署 发布 build'},
    {title:'故障排除',section:'开发与部署',url:'troubleshooting.html',keywords:'troubleshooting 问题 错误 debug'},
    {title:'更新日志',section:'开发与部署',url:'changelog.html',keywords:'changelog 更新 版本'},
  ];

  searchInput.addEventListener('input', function(){
    var q = this.value.trim().toLowerCase();
    if(!q){ searchResults.classList.remove('active'); return; }
    var matches = pages.filter(function(p){
      return (p.title.toLowerCase().indexOf(q)!==-1) || (p.keywords.indexOf(q)!==-1);
    });
    if(matches.length === 0){ searchResults.classList.remove('active'); return; }
    searchResults.innerHTML = matches.map(function(m){
      return '<a href="'+m.url+'" class="search-result-item"><div class="search-result-title">'+m.title+'</div><div class="search-result-section">'+m.section+'</div></a>';
    }).join('');
    searchResults.classList.add('active');
  });

  document.addEventListener('click', function(e){
    if(!e.target.closest('.search-wrapper')) searchResults.classList.remove('active');
  });

  // Ctrl+K shortcut
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && e.key === 'k'){
      e.preventDefault();
      searchInput.focus();
    }
    if(e.key === 'Escape') searchResults.classList.remove('active');
  });
})();