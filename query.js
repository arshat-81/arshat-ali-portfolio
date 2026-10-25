/* The query form. There is no server behind this site, so the message is handed to the free FormSubmit.co relay,
   which mails it to the address below. If the relay is down, the visitor gets a mailto link and a copy button instead. */
(function () {
  var form = document.getElementById("qform");
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var mail = ["arshat_ali", "protonmail.com"].join("@");
  var endpoint = "https://formsubmit.co/ajax/" + mail;
  var field = function (name) { return form.elements[name]; };

  /* the email address shown in "other ways" is put together here, not written into the page */
  var mailRow = $("mailrow");
  if (mailRow) { var link = document.createElement("a"); link.href = "mailto:" + mail; link.textContent = mail; mailRow.appendChild(link); }

  /* the status bar: Draft, Sending, Sent */
  var stages = $("stages") ? $("stages").children : [];
  function stage(n) { for (var i = 0; i < stages.length; i++) stages[i].className = i < n ? "done" : (i === n ? "on" : ""); }

  var send = $("qsend"), sendLabel = send.querySelector(".lbl"), status = $("qstatus");
  var msg = field("message"), count = $("qcount");
  function updateCount() { count.textContent = msg.value.length + " / 4000"; }
  msg.addEventListener("input", updateCount);
  updateCount();

  /* checks, with the words next to the field that needs them */
  var RULES = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Tell me what to call you."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "That does not look like an email address."; },
    topic: function (v) { return v ? "" : "Pick what it is about."; },
    message: function (v) { return v.trim().length >= 20 ? "" : "A few more words, please (at least 20 characters)."; }
  };
  function check(name) {
    var el = field(name), wrap = el.closest(".fld"), problem = RULES[name](el.value);
    wrap.classList.toggle("bad", !!problem);
    wrap.querySelector(".err").textContent = problem;
    el.setAttribute("aria-invalid", problem ? "true" : "false");
    return problem ? el : null;
  }
  Object.keys(RULES).forEach(function (name) {
    field(name).addEventListener("blur", function () { check(name); });
    field(name).addEventListener("input", function () { if (field(name).closest(".fld").classList.contains("bad")) check(name); });
  });

  function values() {
    return {
      name: field("name").value.trim(),
      email: field("email").value.trim(),
      topic: field("topic").value,
      odoo_version: field("odoo_version").value || "not given",
      message: field("message").value.trim()
    };
  }
  function busy(on) {
    send.disabled = on;
    send.classList.toggle("busy", on);
    sendLabel.textContent = on ? "Sending..." : "Send query";
    send.querySelector("use").setAttribute("href", on ? "#i-flip" : "#i-send");
    status.textContent = on ? "Sending your message." : "";
  }
  function show(panel) {
    ["qdone", "qfail"].forEach(function (id) { $(id).hidden = id !== panel; });
    form.hidden = !!panel && panel === "qdone";
    var target = panel ? $(panel) : null;
    if (target) { target.scrollIntoView({ block: "center", behavior: "smooth" }); target.focus({ preventScroll: true }); }
  }

  function done(ref) {
    $("qref").textContent = ref;
    busy(false);
    stage(3);
    show("qdone");
  }
  function fail(reason, d, ref) {
    busy(false);
    stage(0);
    $("qwhy").textContent = reason;
    var body = "Reference " + ref + "\nName: " + d.name + "\nEmail: " + d.email + "\nOdoo version: " + d.odoo_version + "\n\n" + d.message;
    $("qmailto").href = "mailto:" + mail + "?subject=" + encodeURIComponent("[portfolio] " + d.topic + " (" + ref + ")") + "&body=" + encodeURIComponent(body.slice(0, 1800));
    $("qcopy").onclick = function () {
      var b = this, ok = function () { b.lastChild.textContent = "Copied"; setTimeout(function () { b.lastChild.textContent = "Copy message"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(body).then(ok, function () {});
    };
    show("qfail");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = null;
    Object.keys(RULES).forEach(function (name) { var bad = check(name); if (bad && !first) first = bad; });
    if (first) { first.focus(); status.textContent = "Please fix the marked fields."; return; }
    var d = values(), ref = "Q-" + Date.now().toString(36).toUpperCase().slice(-6);

    if (field("_honey").value) { done(ref); return; }    /* a bot filled the hidden field: look successful, send nothing */

    busy(true);
    stage(1);
    var body = {
      name: d.name, email: d.email, topic: d.topic, odoo_version: d.odoo_version, message: d.message,
      reference: ref, sent_from: location.href,
      _subject: "[arshat-ali.runs-on.dev] " + d.topic + " (" + ref + ") from " + d.name,
      _template: "table", _captcha: "false"
    };
    fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j || {} }; }); })
      .then(function (res) {
        if (res.ok && (res.j.success === true || res.j.success === "true")) done(ref);
        else fail(res.j.message ? String(res.j.message) : "The mail relay answered with an error.", d, ref);
      })
      .catch(function () { fail("The mail relay could not be reached.", d, ref); });
  });

  $("qagain").addEventListener("click", function () {
    form.reset(); updateCount();
    Object.keys(RULES).forEach(function (name) { field(name).closest(".fld").classList.remove("bad"); });
    stage(0); show(null); form.hidden = false; field("name").focus();
  });
  $("qretry").addEventListener("click", function () { show(null); form.hidden = false; stage(0); field("message").focus(); });
})();
