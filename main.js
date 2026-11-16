(function () {
  var S = window.SITE, $ = function (q, r) { return (r || document).querySelector(q); }, $$ = function (q, r) { return [].slice.call((r || document).querySelectorAll(q)); };
  var money = function (n, ph) { return S.price ? '₮' + n.toLocaleString('en-US') : ph; };

  $$('[data-price]').forEach(function (e) { e.textContent = money(S.price, '₮00,000'); });
  $$('[data-mail]').forEach(function (e) { e.textContent = S.email; e.href = 'mailto:' + S.email; });

  // Announcement banner: stays closed for this visitor once dismissed.
  var ann = $('#ann');
  try { if (localStorage.getItem('annClosed') === ann.textContent.trim()) ann.hidden = true; } catch (e) {}
  $('#annClose').addEventListener('click', function () {
    try { localStorage.setItem('annClosed', ann.textContent.trim()); } catch (e) {}
    ann.hidden = true;
  });

  // Mobile menu
  var menu = $('#menuBtn'), links = $('#links');
  var setMenu = function (o) { links.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); };
  menu.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

  // Quotes: blacked-out words reveal on tap; dots switch quotes.
  $$('.rd').forEach(function (b) {
    b.setAttribute('aria-label', 'Нуугдсан үгийг нээх');
    b.addEventListener('click', function () { b.classList.add('open'); b.removeAttribute('aria-label'); });
  });
  var qs = $$('#qs figure'), dots = $('#dots');
  qs.forEach(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button'; d.setAttribute('aria-label', 'Эшлэл ' + (i + 1)); if (!i) d.className = 'on';
    d.addEventListener('click', function () {
      qs.forEach(function (q, j) { q.classList.toggle('on', i === j); });
      $$('button', dots).forEach(function (x, j) { x.classList.toggle('on', i === j); });
    });
    dots.appendChild(d);
  });

  // Order form
  var city = $('#city');
  ['Улаанбаатар', 'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган', 'Говь-Алтай', 'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь', 'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар', 'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий'].forEach(function (c) { city.add(new Option(c)); });

  var qty = 1;
  var totals = function () {
    $('#qty').textContent = qty; $('#sQty').textContent = qty;
    $('#sBook').textContent = money(S.price * qty, '₮00,000');
    $('#sShip').textContent = S.price ? '₮' + S.delivery.toLocaleString('en-US') : '₮0,000';
    $('#sTot').textContent = money(S.price * qty + S.delivery, '₮00,000');
    $('#minus').disabled = qty === 1;
  };
  $('#minus').addEventListener('click', function () { if (qty > 1) { qty--; totals(); } });
  $('#plus').addEventListener('click', function () { if (qty < 99) { qty++; totals(); } });
  totals();

  $$('input[name=pay]').forEach(function (r) {
    r.addEventListener('change', function () { $$('.pp').forEach(function (p) { p.hidden = p.dataset.pay !== r.value; }); });
  });

  var check = function (form) {
    var bad = null;
    $$('[data-err]', form).forEach(function (i) {
      var ok = i.checkValidity(), m = $('.err', i.parentNode);
      i.setAttribute('aria-invalid', !ok); m.textContent = ok ? '' : i.dataset.err;
      if (!ok && !bad) bad = i;
    });
    if (bad) bad.focus();
    return !bad;
  };
  $$('[data-err]').forEach(function (i) {
    i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true' && i.checkValidity()) { i.setAttribute('aria-invalid', false); $('.err', i.parentNode).textContent = ''; } });
  });

  var form = $('#orderForm'), done = $('#done');
  var finish = function (t, p) {
    $('#doneT').textContent = t; $('#doneP').textContent = p;
    form.hidden = true; done.hidden = false; done.focus();
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!check(form)) return;
    var data = Object.fromEntries(new FormData(form)); data.quantity = qty;
    if (!S.orderEndpoint) return finish('Туршилтын горим', 'Захиалга илгээгдээгүй. Захиалгын систем холбогдсоны дараа энэ хэсэг ажиллана.');
    var btn = $('button[type=submit]', form); btn.disabled = true;
    fetch(S.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw 0; finish('Захиалга хүлээн авлаа', 'Бид тантай удахгүй холбогдоно.'); })
      .catch(function () { btn.disabled = false; finish('Алдаа гарлаа', 'Захиалга илгээгдсэнгүй. Дахин оролдоно уу, эсвэл ' + S.email + ' хаягаар холбогдоно уу.'); });
  });
  $('#again').addEventListener('click', function () {
    form.reset(); qty = 1; totals(); $('input[name=pay]').dispatchEvent(new Event('change'));
    done.hidden = true; form.hidden = false;
  });

  // Contact: opens the visitor's email app, addressed to the site email.
  var cf = $('#contactForm');
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!check(cf)) return;
    var body = $('#cMsg').value + '\n\n' + $('#cName').value + ' (' + $('#cMail').value + ')';
    location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent('Санал, захидал') + '&body=' + encodeURIComponent(body);
  });

  // Phone order bar hides while the order section is on screen.
  if ('IntersectionObserver' in window) new IntersectionObserver(function (x) { $('#bar').classList.toggle('off', x[0].isIntersecting); }).observe($('#order'));
})();
