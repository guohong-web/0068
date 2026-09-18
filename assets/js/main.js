/* ==========================================================================
   网站开发基础教程 · 交互脚本（无任何第三方依赖）
   功能：侧边导航渲染 / 搜索 / 主题切换 / 目录滚动高亮 / 代码复制 /
        标签页 / 阅读进度 / 移动端抽屉
   ========================================================================== */
(function () {
  'use strict';

  var body = document.body;
  var ROOT = body.getAttribute('data-root') || '';

  /* ---------- 1. 导航配置（全站唯一数据源） ---------- */
  var NAV = [
    {
      title: '开始',
      items: [
        { t: '教程首页', i: '🏠', h: ROOT + 'index.html' },
        { t: '学习路线图', i: '🗺️', h: ROOT + 'index.html#roadmap' },
        { t: '技术栈全景', i: '🧩', h: ROOT + 'index.html#stack' },
        { t: '从 0 到 1 流程', i: '🚀', h: ROOT + 'index.html#workflow' }
      ]
    },
    {
      title: '原理篇',
      items: [
        { t: '原理与概念', i: '🧠', h: ROOT + 'pages/concepts.html' },
        { t: '网络与 HTTP', i: '🌐', h: ROOT + 'pages/concepts.html#network' },
        { t: '并发与进程', i: '⚙️', h: ROOT + 'pages/concepts.html#concurrency' },
        { t: '分层与耦合', i: '🧱', h: ROOT + 'pages/concepts.html#abstraction' },
        { t: '一致性与可用性', i: '⚖️', h: ROOT + 'pages/concepts.html#cap' }
      ]
    },
    {
      title: '基础篇',
      items: [
        { t: '前端基础', i: '🎨', h: ROOT + 'pages/frontend.html' },
        { t: '后端语言选型', i: '⌨️', h: ROOT + 'pages/languages.html' }
      ]
    },
    {
      title: '工程篇',
      items: [
        { t: '搭建思路', i: '🏗️', h: ROOT + 'pages/architecture.html' },
        { t: '部署思路', i: '📦', h: ROOT + 'pages/deployment.html' },
        { t: '运维思路', i: '🛡️', h: ROOT + 'pages/ops.html' }
      ]
    },
    {
      title: '查阅',
      items: [
        { t: '专业术语词典', i: '📖', h: ROOT + 'pages/glossary.html' },
        { t: '网络与协议术语', i: '🔌', h: ROOT + 'pages/glossary.html#g-network' },
        { t: '数据库术语', i: '🗄️', h: ROOT + 'pages/glossary.html#g-db' },
        { t: '架构术语', i: '🏛️', h: ROOT + 'pages/glossary.html#g-arch' },
        { t: '安全术语', i: '🔐', h: ROOT + 'pages/glossary.html#g-security' }
      ]
    },
    {
      title: '附录',
      items: [
        { t: '学习资源清单', i: '📚', h: ROOT + 'index.html#resources' },
        { t: '常见问题', i: '❓', h: ROOT + 'index.html#faq' }
      ]
    }
  ];

  /* ---------- 2. 当前页面识别 ---------- */
  function currentFile() {
    var p = window.location.pathname.replace(/\\/g, '/').split('/').pop();
    return p === '' ? 'index.html' : p;
  }
  var FILE = currentFile();

  /* ---------- 3. 渲染侧边导航 ---------- */
  var sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    var html = '<div class="side-search">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' +
      '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>' +
      '<input type="search" id="navSearch" placeholder="搜索章节…" autocomplete="off" aria-label="搜索章节">' +
      '</div>';

    NAV.forEach(function (g) {
      html += '<div class="nav-group" data-group><div class="nav-group__title">' + g.title + '</div><ul class="nav-list">';
      g.items.forEach(function (it) {
        var target = it.h.split('#')[0].split('/').pop();
        var isCurrent = target === FILE;
        var hash = it.h.indexOf('#') > -1 ? it.h.split('#')[1] : '';
        var active = '';
        if (isCurrent) {
          // 无 hash 的首页条目：仅在当前无锚点时高亮
          if (!hash && !window.location.hash) active = ' is-active';
          if (hash && window.location.hash === '#' + hash) active = ' is-active';
        }
        html += '<li><a class="' + active.trim() + '" href="' + it.h + '" data-text="' + (g.title + it.t) + '">' +
          '<span class="ni">' + it.i + '</span>' + it.t + '</a></li>';
      });
      html += '</ul></div>';
    });

    html += '<div class="nav-tip"><b>提示</b><br>按 <code>/</code> 快速聚焦搜索框，按 <code>Esc</code> 关闭移动端导航。</div>';
    sidebar.innerHTML = html;

    // 精确锚点高亮
    if (window.location.hash) {
      var links = sidebar.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute('href') === window.location.pathname.split('/').pop() + window.location.hash) {
          links[i].classList.add('is-active');
        }
      }
    }
  }

  /* ---------- 4. 导航搜索 ---------- */
  var searchInput = document.getElementById('navSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      var any = false;
      sidebar.querySelectorAll('.nav-group').forEach(function (g) {
        var hit = 0;
        g.querySelectorAll('.nav-list li').forEach(function (li) {
          var text = li.querySelector('a').getAttribute('data-text').toLowerCase();
          var ok = !q || text.indexOf(q) > -1;
          li.style.display = ok ? '' : 'none';
          if (ok) hit++;
        });
        g.style.display = hit ? '' : 'none';
        if (hit) any = true;
      });
      var empty = sidebar.querySelector('.nav-empty');
      if (!any && !empty) {
        var d = document.createElement('div');
        d.className = 'nav-empty';
        d.textContent = '没有匹配的章节';
        sidebar.appendChild(d);
      } else if (any && empty) {
        empty.remove();
      }
    });
  }

  /* 快捷键：/ 聚焦搜索，Esc 关闭抽屉 */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea';
    if (e.key === '/' && !typing && searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      body.classList.remove('nav-open');
      if (typing) e.target.blur();
    }
  });

  /* ---------- 5. 移动端抽屉 ---------- */
  var burger = document.querySelector('.topbar__burger');
  var mask = document.querySelector('.mask');
  if (burger) {
    burger.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }
  if (mask) {
    mask.addEventListener('click', function () { body.classList.remove('nav-open'); });
  }
  if (sidebar) {
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a')) body.classList.remove('nav-open');
    });
  }

  /* ---------- 6. 主题切换 ---------- */
  var THEME_KEY = 'wsdev-tutorial-theme';
  var themeBtn = document.getElementById('themeBtn');

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.textContent = t === 'dark' ? '☀' : '☾';
      themeBtn.setAttribute('aria-label', t === 'dark' ? '切换到浅色主题' : '切换到深色主题');
      themeBtn.setAttribute('title', t === 'dark' ? '浅色主题' : '深色主题');
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (err) { saved = null; }
  if (!saved) {
    saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(saved);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* 忽略隐私模式 */ }
    });
  }

  /* ---------- 7. 代码复制 ---------- */
  document.querySelectorAll('.code').forEach(function (box) {
    var head = box.querySelector('.code__head');
    var pre = box.querySelector('pre');
    if (!head || !pre) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code__copy';
    btn.textContent = '复制';
    head.appendChild(btn);

    btn.addEventListener('click', function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = '已复制 ✓';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = '复制';
          btn.classList.remove('is-done');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { btn.textContent = '复制失败'; }
        ta.remove();
      }
    });
  });

  /* ---------- 8. 标签页 ---------- */
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('.tab-btn');
    var panels = tabs.querySelectorAll('.tab-panel');
    btns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        if (panels[idx]) panels[idx].classList.add('is-active');
      });
    });
  });

  /* ---------- 9. 标题锚点 + 右侧目录 ---------- */
  var content = document.querySelector('.content');
  var tocBox = document.querySelector('.toc');

  function slug(text, used) {
    var s = text.trim().toLowerCase()
      .replace(/[\s\u3000]+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-') || 'section';
    var base = s, n = 2;
    while (used[s]) { s = base + '-' + n++; }
    used[s] = true;
    return s;
  }

  if (content) {
    var used = {};
    var heads = content.querySelectorAll('h2, h3');
    var tocItems = [];

    heads.forEach(function (h) {
      if (!h.id) h.id = slug(h.textContent, used);
      h.setAttribute('data-heading', '1');

      var link = document.createElement('a');
      link.className = 'anchor';
      link.href = '#' + h.id;
      link.textContent = '#';
      link.setAttribute('aria-hidden', 'true');
      h.insertBefore(link, h.firstChild);

      tocItems.push({ id: h.id, text: h.textContent.replace(/^#/, '').trim(), lv: h.tagName === 'H3' ? 3 : 2 });
    });

    if (tocBox) {
      if (!tocItems.length) {
        tocBox.style.display = 'none';
      } else {
        var u = '<div class="toc__title">本页目录</div><ul>';
        tocItems.forEach(function (it) {
          u += '<li><a class="lv' + it.lv + '" href="#' + it.id + '">' + it.text + '</a></li>';
        });
        u += '</ul>';
        tocBox.innerHTML = u;
      }
    }

    /* 滚动高亮 */
    if (tocBox && tocItems.length) {
      var tocLinks = tocBox.querySelectorAll('a');
      var ticking = false;

      var sync = function () {
        ticking = false;
        var offset = 110;
        var activeId = tocItems[0].id;
        for (var i = 0; i < tocItems.length; i++) {
          var el = document.getElementById(tocItems[i].id);
          if (el && el.getBoundingClientRect().top - offset <= 0) activeId = tocItems[i].id;
        }
        tocLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + activeId);
        });

        // 阅读进度
        var bar = document.getElementById('progress');
        if (bar) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          var pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
          bar.style.width = pct + '%';
        }
      };

      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(sync); }
      }, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    }
  }

  /* ---------- 10. 表格首列加粗（提升可扫读性） ---------- */
  document.querySelectorAll('table.table-key tbody tr').forEach(function (tr) {
    var td = tr.querySelector('td');
    if (td && !td.querySelector('strong')) {
      td.innerHTML = '<strong>' + td.innerHTML + '</strong>';
    }
  });

  /* ---------- 12. 打印友好：展开全部折叠项 ---------- */
  if (window.matchMedia) {
    window.matchMedia('print').addEventListener('change', function (e) {
      if (e.matches) {
        document.querySelectorAll('details').forEach(function (d) { d.open = true; });
      }
    });
  }
})();
