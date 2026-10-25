(function () {
  var root = document.documentElement, body = document.body;
  var RM = root.classList.contains("rm");
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* the page links to clean addresses ("query", "./"); opened straight from disk there is no server to resolve them */
  if (location.protocol === "file:") $$("a[href]").forEach(function (a) {
    var h = a.getAttribute("href");
    if (h === "query") a.setAttribute("href", "query.html");
    else if (h === "./") a.setAttribute("href", "index.html");
    else if (h.indexOf("./#") === 0) a.setAttribute("href", "index.html" + h.slice(2));
  });

  /* ---------- contact buttons: the address is assembled here so it is not sitting in the HTML for scrapers ---------- */
  var box = document.getElementById("links");
  var mail = ["arshat_ali", "protonmail.com"];
  if (box) {
    var last = box.querySelector(".btn");   // the first button in the page (Send a query) stays first
    [["Email me", "mailto:" + mail[0] + "@" + mail[1], false, "mail"], ["LinkedIn", "https://www.linkedin.com/in/arshat-ali", true, "link"]].forEach(function (it) {
      var a = document.createElement("a");
      a.className = "btn";
      a.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-' + it[3] + '"/></svg>';
      a.appendChild(document.createTextNode(it[0]));
      a.href = it[1];
      if (it[2]) { a.target = "_blank"; a.rel = "noopener"; }
      box.insertBefore(a, last ? last.nextSibling : box.firstChild);
      last = a;
    });
    $$(".btn", box).forEach(function (b, i) { b.classList.toggle("main", i === 0); });
  }

  /* ---------- debug mode, like Odoo's ?debug=1 ---------- */
  function setDebug(on) { body.classList.toggle("debug", on); }
  if (/[?&]debug=1\b/.test(location.search)) setDebug(true);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "d" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    setDebug(!body.classList.contains("debug"));
  });

  /* ---------- boot screen, once per visit ---------- */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    root.classList.add("ready");
    reveals();
  }
  function boot() {
    var skip = RM || /[?&]boot=skip\b/.test(location.search) || body.hasAttribute("data-noboot");
    try { if (sessionStorage.getItem("booted")) skip = true; else sessionStorage.setItem("booted", "1"); } catch (e) {}
    if (skip) { start(); return; }
    var el = document.createElement("div");
    el.id = "boot";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<pre></pre><div class="hint">click or press any key to skip</div>';
    body.appendChild(el);
    body.classList.add("booting");
    var pre = el.firstChild;
    var G = '<span class="g">INFO</span> ';
    var lines = [
      '<span class="d">$</span> odoo-bin -d arshat_ali -i arshat_ali --test-enable',
      G + 'odoo.modules.loading: loading 1 modules...',
      G + 'odoo.modules.loading: Loading module arshat_ali (1/1)',
      G + 'odoo.modules.module: 16 add-ons, 4 versions, 1 person',
      G + 'odoo.tests.result: 0 failed, 0 error(s) of 355 tests',
      G + 'odoo.service.server: HTTP service running on arshat-ali.runs-on.dev'
    ];
    var i = 0, done = false, timer;
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      el.classList.add("out");
      body.classList.remove("booting");
      setTimeout(start, 380);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1100);
    }
    function next() {
      if (done) return;
      if (i >= lines.length) { timer = setTimeout(finish, 450); return; }
      pre.innerHTML += lines[i++] + "\n";
      timer = setTimeout(next, 240);
    }
    el.addEventListener("click", finish);
    document.addEventListener("keydown", finish, { once: true });
    next();
  }

  /* ---------- scroll reveals, typed labels, bars, counters ---------- */
  var REVEAL = "[data-r], .readme dl > *, .mods tbody tr, .job, .cat li, .cat header, .rows li, .edu > div";
  function reveals() {
    var groups = new Map();
    $$(REVEAL).forEach(function (el) {
      var p = el.parentNode, n = groups.get(p) || 0;
      groups.set(p, n + 1);
      el.style.setProperty("--d", Math.min(n * 70, 420) + "ms");
    });
    if (RM || !("IntersectionObserver" in window)) { root.classList.add("reveal-all"); countAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
        $$("[data-count]", en.target).forEach(count);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    $$(REVEAL + ", .file").forEach(function (el) { io.observe(el); });
  }
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), t0 = null, dur = 1300;
    if (RM) { el.textContent = end; return; }
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = end;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }
  function countAll() { $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count"); }); }

  /* ---------- add-ons by Odoo version (from the store listings on 26 October 2026) ---------- */
  var MODS = [
    ["ai_module_migrator", "Module Migration AI", [17, 18, 19, 20]],
    ["mdx_mcp_server", "MCP Server", [17, 18, 19, 20]],
    ["mdx_api_gateway", "REST API", [17, 18, 19, 20]],
    ["mdx_object_storage", "S3 Attachment Storage", [17, 18, 19, 20]],
    ["mdx_access_control", "User Access Control", [17, 18, 19, 20]],
    ["mdx_access_manager", "Access Rights Manager", [17, 18, 19, 20]],
    ["mdx_perf_auditor", "Performance Auditor", [17, 18, 19, 20]],
    ["mdx_backup_manager", "Database Backup", [17, 18, 19, 20]],
    ["mdx_credential_vault", "Credential Encryption", [17, 18, 19, 20]],
    ["mdx_security_simulator", "Access Rights Simulator", [17, 18, 19, 20]],
    ["mdx_upgrade_scanner", "Upgrade Scanner", [17, 18, 19]],
    ["mdx_external_id_finder", "XML ID Finder", [17, 18, 19]],
    ["data_insight_workbench", "SQL Query Builder", [17, 18, 19]],
    ["mdx_keep_debug", "Keep Debug Mode On", [18, 19, 20]],
    ["mdx_bigcommerce_connector", "BigCommerce Connector", [19, 20]],
    ["mdx_login_studio", "Login Page Designer", [19]]
  ];
  var selected = 0;
  function selectVersion(v) {
    selected = v;
    $$(".vcol").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-v") === v)); });
    $$("[data-mod]").forEach(function (el) {
      var m = MODS.filter(function (x) { return x[0] === el.getAttribute("data-mod"); })[0];
      var off = !!(v && m && m[2].indexOf(v) < 0);
      el.classList.toggle("off", off);
      el.style.setProperty("--note", off ? '"not on Odoo ' + v + ' yet"' : '""');
    });
  }
  var vcols = document.querySelector(".vcols");
  if (vcols) {
    [17, 18, 19, 20].forEach(function (v) {
      var n = MODS.filter(function (m) { return m[2].indexOf(v) > -1; }).length;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "vcol";
      b.setAttribute("data-v", v);
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Odoo " + v + ": " + n + " add-ons. Show only these in the list below.");
      var cells = document.createElement("span");
      cells.className = "cells";
      MODS.forEach(function (m, i) {
        var c = document.createElement("i"), on = m[2].indexOf(v) > -1;
        if (!on) c.className = "gh";
        c.style.setProperty("--i", i);
        c.title = m[1] + (on ? "" : " (not on Odoo " + v + ")");
        cells.appendChild(c);
      });
      var lab = document.createElement("span");
      lab.className = "vl";
      lab.innerHTML = "<span>Odoo " + v + "</span><b>" + n + "</b>";
      b.appendChild(cells);
      b.appendChild(lab);
      b.addEventListener("click", function () { selectVersion(selected === v ? 0 : v); });
      vcols.appendChild(b);
    });
  }

  /* ---------- experience: entries that open and close ---------- */
  $$(".job").forEach(function (job) {
    var head = job.querySelector(".job-head");
    head.addEventListener("click", function () {
      var open = !job.classList.contains("open");
      job.classList.toggle("open", open);
      head.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- file tree: sliding highlight + active section ---------- */
  var nav = document.querySelector(".tree nav"), ind = nav ? nav.querySelector(".ind") : null;
  var links = {};
  if (nav) $$("a", nav).forEach(function (a) { var h = a.getAttribute("href") || ""; if (h.charAt(0) === "#") links[h.slice(1)] = a; });
  function place(a) {
    if (!a || !nav || !ind) return;
    var row = getComputedStyle(nav).flexDirection === "row";
    ind.style.height = a.offsetHeight + "px";
    ind.style.width = row ? a.offsetWidth + "px" : "100%";
    ind.style.transform = row ? "translateX(" + a.offsetLeft + "px)" : "translateY(" + a.offsetTop + "px)";
  }
  var firstSection = document.querySelector("main > section");
  var current = firstSection ? firstSection.id : "manifest";
  function setActive(id) {
    if (!links[id]) return;
    current = id;
    Object.keys(links).forEach(function (k) { links[k].classList.toggle("on", k === id); });
    var tb = document.getElementById("tbsec");
    if (tb) tb.textContent = (links[id].getAttribute("data-label") || "").split(" \u00b7 ")[0];
    place(links[id]);
  }
  setActive(current);
  window.addEventListener("resize", function () { place(links[current]); });
  window.addEventListener("load", function () { place(links[current]); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(links[current]); });
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$("main > section").forEach(function (s) { so.observe(s); });
  }

  /* ---------- one scroll loop: progress bar, parallax stamp, marquee speed ---------- */
  var bands = [];
  if (!RM && document.documentElement.animate) {
    $$(".band").forEach(function (band, i) {
      var tr = band.firstElementChild;
      var a = tr.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration: i ? 42000 : 52000, iterations: Infinity });
      a.currentTime = 1e8;
      bands.push({ a: a, base: parseFloat(band.getAttribute("data-base")) || 1 });
    });
  }
  var lastY = window.pageYOffset, vel = 0, dir = 1, ticking = false;
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  function frame() {
    ticking = false;
    var y = window.pageYOffset, max = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    if (!RM) root.style.setProperty("--py", Math.max(-60, -y * 0.12).toFixed(1) + "px");
    var dy = y - lastY; lastY = y;
    vel = vel * 0.8 + Math.abs(dy) * 0.2;
    if (Math.abs(dy) > 1) dir = dy > 0 ? 1 : -1;
    bands.forEach(function (b) { b.a.playbackRate = b.base * dir * (1 + Math.min(vel / 6, 7)); });
    if (vel > 0.2) { ticking = true; requestAnimationFrame(frame); }
  }
  frame();

  /* ---------- cursor, magnetic buttons, tilt, flip ---------- */
  if (fine && !RM) {
    var dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cur-dot"; ring.className = "cur-ring";
    ring.innerHTML = "<i></i>";
    body.appendChild(dot); body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100, label = ring.firstChild;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      body.classList.add("cur-on");
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      var t = e.target.closest ? e.target.closest("a, button, [data-cursor]") : null;
      if (t && t.closest(".tree")) t = null;   // the sidebar has its own tooltips, so the cursor stays small over it
      var text = t ? (t.getAttribute("data-cursor") || (t.tagName === "A" ? "open" : "")) : "";
      ring.classList.toggle("hot", !!t);
      label.textContent = text;
    }, { passive: true });
    document.addEventListener("mouseleave", function () { body.classList.remove("cur-on"); });
    (function loop() {
      rx += (mx - rx) * 0.17; ry += (my - ry) * 0.17;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) scale(" + (ring.classList.contains("hot") ? 1.7 : 1) + ")";
      requestAnimationFrame(loop);
    })();

    $$(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.32;
        b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });

    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("moving");
        el.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-y * 11).toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("moving");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      });
    });
  }

  $$(".flip").forEach(function (card) {
    var btn = card.querySelector(".flip-btn"), front = card.querySelector(".front"), back = card.querySelector(".back");
    function set(on) {
      card.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      front.setAttribute("aria-hidden", on ? "true" : "false");
      back.setAttribute("aria-hidden", on ? "false" : "true");
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(!card.classList.contains("on")); });
    card.addEventListener("click", function () { set(!card.classList.contains("on")); });
  });

  $$(".motion").forEach(function (b) {
    b.setAttribute("aria-pressed", RM ? "false" : "true");
    b.querySelector(".lbl").textContent = RM ? "motion: off" : "motion: on";
    b.addEventListener("click", function () {
      try { localStorage.setItem("motion", RM ? "on" : "off"); sessionStorage.removeItem("booted"); } catch (e) {}
      location.reload();
    });
  });

  /* ---------- sidebar: open, or folded into a strip of icons (a menu that slides in on phones) ---------- */
  var sidebar = document.getElementById("sidebar"), railBtn = document.querySelector(".rail-toggle");
  var menuBtn = document.querySelector(".menu-btn"), scrim = document.getElementById("scrim");
  var phone = window.matchMedia ? matchMedia("(max-width: 940px)") : { matches: false };
  var drawerOpen = false;
  function railOn() { return root.getAttribute("data-sidebar") === "rail"; }
  function paintSidebar() {
    if (!railBtn) return;
    railBtn.setAttribute("aria-expanded", String(phone.matches ? drawerOpen : !railOn()));
    railBtn.setAttribute("aria-label", phone.matches ? "Close the menu" : (railOn() ? "Expand the sidebar" : "Collapse the sidebar"));
  }
  function setDrawer(on) {
    if (!sidebar) return;
    drawerOpen = on;
    sidebar.classList.toggle("open", on);
    if (scrim) scrim.classList.toggle("on", on);
    body.classList.toggle("nav-open", on);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", String(on));
    paintSidebar();
    if (on) { var first = sidebar.querySelector("nav a"); if (first) first.focus({ preventScroll: true }); }
    else if (menuBtn && sidebar.contains(document.activeElement)) menuBtn.focus();
  }
  function toggleRail() {
    var next = railOn() ? "open" : "rail";
    root.setAttribute("data-sidebar", next);
    try { localStorage.setItem("sidebar", next); } catch (e) {}
    paintSidebar();
    hideTip();
    setTimeout(function () { place(links[current]); }, 460);
  }
  var tip = document.createElement("div");
  tip.className = "tip";
  tip.setAttribute("role", "tooltip");
  body.appendChild(tip);
  function hideTip() { tip.classList.remove("on"); }
  function showTip(el) {
    if (phone.matches || !railOn()) return;
    var label = el.getAttribute("data-label") || (el.querySelector(".lbl") ? el.querySelector(".lbl").textContent : "") || el.getAttribute("aria-label") || "";
    var r = el.getBoundingClientRect();
    tip.textContent = label;
    tip.style.left = Math.round(r.right + 14) + "px";
    tip.style.top = Math.round(r.top + r.height / 2) + "px";
    tip.classList.add("on");
  }
  $$(".tree nav a, .tree .motion, .tree .theme, .rail-toggle, .tree .mark").forEach(function (el) {
    el.addEventListener("mouseenter", function () { showTip(el); });
    el.addEventListener("focus", function () { showTip(el); });
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("blur", hideTip);
  });
  if (railBtn) railBtn.addEventListener("click", function () { if (phone.matches) setDrawer(false); else toggleRail(); });
  if (menuBtn) menuBtn.addEventListener("click", function () { setDrawer(!drawerOpen); });
  if (scrim) scrim.addEventListener("click", function () { setDrawer(false); });
  if (sidebar) $$("nav a", sidebar).forEach(function (a) { a.addEventListener("click", function () { if (phone.matches) setDrawer(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawerOpen) setDrawer(false);
    if (e.key === "[" && !phone.matches && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName)) toggleRail();
  });
  function onViewport() { if (!phone.matches && drawerOpen) setDrawer(false); paintSidebar(); place(links[current]); }
  if (phone.addEventListener) phone.addEventListener("change", onViewport); else if (phone.addListener) phone.addListener(onViewport);
  paintSidebar();

  /* ---------- theme: by the clock unless the visitor chose ---------- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function labelTheme() {
    var mode = root.getAttribute("data-theme-mode"), theme = root.getAttribute("data-theme");
    $$(".theme").forEach(function (b) {
      b.querySelector(".lbl").textContent = mode === "auto" ? "theme: auto, " + theme : "theme: " + theme;
      b.querySelector("use").setAttribute("href", theme === "dark" ? "#i-moon" : "#i-sun");
      b.setAttribute("aria-label", "Colour theme: " + (mode === "auto" ? "automatic, " + theme + " right now (light from 6 am to 6 pm)" : theme) + ". Click to change.");
    });
  }
  function paintTheme(theme, fade) {
    if (fade && !RM) { root.classList.add("tfade"); setTimeout(function () { root.classList.remove("tfade"); }, 700); }
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#090e16" : "#eef1f6");
    labelTheme();
  }
  $$(".theme").forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = { auto: "light", light: "dark", dark: "auto" }[root.getAttribute("data-theme-mode")] || "auto";
      try { localStorage.setItem("theme", mode); } catch (e) {}
      root.setAttribute("data-theme-mode", mode);
      paintTheme(mode === "auto" ? window.mdxTheme.byClock() : mode, true);
    });
  });
  function themeTick() {
    if (root.getAttribute("data-theme-mode") !== "auto") return;
    var now = window.mdxTheme.byClock();
    if (now !== root.getAttribute("data-theme")) paintTheme(now, true);
  }
  setInterval(themeTick, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) themeTick(); });
  labelTheme();

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  boot();
  window.__ok = true;
})();
