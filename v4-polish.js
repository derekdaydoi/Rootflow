/* Rootflow focused UI polish — account editing + cashflow anatomy.
   Additive on purpose: no financial logic is changed here. */
(function () {
  'use strict';

  function textOf(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function enhanceUndatedObligations(root) {
    var rows = (root || document).querySelectorAll('.rf-obligation.is-undated:not([data-rf-undated-polished])');
    Array.prototype.forEach.call(rows, function (row) {
      row.setAttribute('data-rf-undated-polished', 'true');
      var badge = row.querySelector('.rf-period-badge');
      var main = row.querySelector('.rf-obligation-main');
      var subtitle = main && main.querySelector('small');
      var period = textOf(badge) || 'Trong tháng';
      if (badge) badge.remove();
      if (!subtitle || subtitle.getAttribute('data-rf-period-added') === 'true') return;
      var current = textOf(subtitle);
      var prefix = period === 'Trong tháng' ? 'Trong tháng' : period;
      subtitle.textContent = current ? prefix + ' · ' + current : prefix;
      subtitle.setAttribute('data-rf-period-added', 'true');
    });
  }

  function fieldByLabel(sheet, labels) {
    var fields = sheet.querySelectorAll('.field');
    for (var i = 0; i < fields.length; i++) {
      var label = fields[i].querySelector('.field-label');
      var value = textOf(label);
      if (labels.indexOf(value) >= 0) return fields[i];
    }
    return null;
  }

  function enhanceAccountEdit(sheet) {
    if (!sheet || sheet.getAttribute('aria-label') !== 'Sửa tài khoản') return;
    sheet.classList.add('rf-account-edit-sheet');

    var body = sheet.querySelector('.sheet-body');
    if (body && !body.querySelector('.rf-edit-note')) {
      var note = document.createElement('div');
      note.className = 'rf-edit-note';
      note.innerHTML = '<strong>Chỉnh sửa thông tin tài khoản</strong><span>Các giá trị tài chính bên dưới đều có thể cập nhật. Loại tài khoản chỉ khóa khi cần bảo toàn lịch sử giao dịch.</span>';
      body.insertBefore(note, body.firstChild);
    }

    var derivedCard = sheet.querySelector('.account-current-card');
    if (derivedCard) {
      derivedCard.setAttribute('aria-hidden', 'true');
      derivedCard.classList.add('rf-hide-derived-card');
    }

    var outstanding = fieldByLabel(sheet, ['Dư gốc hiện tại']);
    if (outstanding) {
      outstanding.classList.add('rf-primary-edit-field');
      var label = outstanding.querySelector('.field-label');
      var typeSelect = fieldByLabel(sheet, ['Loại']);
      var type = typeSelect && typeSelect.querySelector('select') ? typeSelect.querySelector('select').value : '';
      if (label) label.textContent = type === 'loan' ? 'Dư nợ hiện tại' : type === 'receivable' ? 'Phải thu hiện tại' : 'Dư gốc hiện tại';
    }

    var outstandingDate = fieldByLabel(sheet, ['Dư gốc tại ngày']);
    if (outstandingDate) {
      outstandingDate.classList.add('rf-primary-edit-date');
      var dateLabel = outstandingDate.querySelector('.field-label');
      if (dateLabel) dateLabel.textContent = 'Ngày số dư hiện tại';
    }

    Array.prototype.forEach.call(sheet.querySelectorAll('.field, .form-divider, .form-grid'), function (node) {
      node.style.minWidth = '0';
    });
  }

  function enhanceAll() {
    enhanceUndatedObligations(document);
    Array.prototype.forEach.call(document.querySelectorAll('.sheet[aria-label="Sửa tài khoản"]'), enhanceAccountEdit);
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      enhanceAll();
    });
  }

  var observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', schedule);
  schedule();
})();
