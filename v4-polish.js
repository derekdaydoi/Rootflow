/* Rootflow legacy-form compatibility polish.
   Scoped only to the existing account editor while the Capital OS presentation
   layer is consolidated. No financial logic or primary-screen rendering here. */
(function () {
  'use strict';

  function textOf(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function fieldByLabel(sheet, labels) {
    var fields = sheet.querySelectorAll('.field');
    for (var i = 0; i < fields.length; i++) {
      var label = fields[i].querySelector('.field-label');
      if (labels.indexOf(textOf(label)) >= 0) return fields[i];
    }
    return null;
  }

  function isOptionalDateField(field) {
    var label = textOf(field && field.querySelector('.field-label'));
    return /có thể để trống|có thể trống|có thể chưa biết|để trống nếu chưa biết/i.test(label);
  }

  function setNativeInputValue(input, value) {
    if (!input) return;
    var descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) descriptor.set.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function enhanceOptionalDateField(field) {
    if (!field || !isOptionalDateField(field)) return;
    var input = field.querySelector('input.date-native[type="date"]');
    if (!input) return;
    field.classList.add('rf-optional-date-field');
    var button = field.querySelector('.rf-optional-clear');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'rf-optional-clear';
      button.textContent = 'Để trống';
      button.setAttribute('aria-label', 'Xóa ngày và để trường này ở trạng thái chưa biết');
      field.appendChild(button);
    }
    function sync() {
      button.hidden = !input.value;
      field.classList.toggle('has-optional-value', Boolean(input.value));
    }
    if (field.getAttribute('data-rf-optional-date-bound') !== 'true') {
      field.setAttribute('data-rf-optional-date-bound', 'true');
      input.addEventListener('input', sync);
      input.addEventListener('change', sync);
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setNativeInputValue(input, '');
        sync();
      });
    }
    sync();
  }

  function reopenSettingsAfterClose(closeButton) {
    if (!closeButton) return;
    closeButton.click();
    var tries = 0;
    function openSettings() {
      var button = document.querySelector('.appbar .icon-button[aria-label="Cài đặt"]');
      if (button) { button.click(); return; }
      tries += 1;
      if (tries < 5) window.setTimeout(openSettings, 24);
    }
    window.setTimeout(openSettings, 0);
  }

  function enhanceAccountBackNavigation(sheet) {
    var head = sheet && sheet.querySelector('.sheet-head');
    if (!head) return;
    var closeButton = head.querySelector('.icon-button[aria-label="Đóng"]');
    if (!closeButton) return;
    closeButton.classList.add('rf-edit-close-spacer');
    closeButton.setAttribute('aria-hidden', 'true');
    closeButton.tabIndex = -1;
    if (head.querySelector('.rf-account-back')) return;
    var backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'icon-button rf-account-back';
    backButton.setAttribute('aria-label', 'Quay lại');
    backButton.setAttribute('title', 'Quay lại');
    backButton.innerHTML = '<svg class="icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>';
    var first = head.firstElementChild;
    if (first && first.tagName === 'DIV') head.replaceChild(backButton, first);
    else head.insertBefore(backButton, head.firstChild);
    backButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      reopenSettingsAfterClose(closeButton);
    });
  }

  function enhanceAccountEdit(sheet) {
    if (!sheet || sheet.getAttribute('aria-label') !== 'Sửa tài khoản') return;
    sheet.classList.add('rf-account-edit-sheet');
    var body = sheet.querySelector('.sheet-body');
    if (body && !body.querySelector('.rf-edit-note')) {
      var note = document.createElement('div');
      note.className = 'rf-edit-note';
      note.innerHTML = '<strong>Chỉnh sửa thông tin tài khoản</strong><span>Các giá trị tài chính có thể cập nhật; Rootflow giữ lịch sử phía dưới để không làm sai dòng tiền.</span>';
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
      var typeField = fieldByLabel(sheet, ['Loại']);
      var type = typeField && typeField.querySelector('select') ? typeField.querySelector('select').value : '';
      if (label) label.textContent = type === 'loan' ? 'Dư nợ hiện tại' : type === 'receivable' ? 'Phải thu hiện tại' : 'Dư gốc hiện tại';
    }
    var outstandingDate = fieldByLabel(sheet, ['Dư gốc tại ngày']);
    if (outstandingDate) {
      var dateLabel = outstandingDate.querySelector('.field-label');
      if (dateLabel) dateLabel.textContent = 'Ngày số dư hiện tại';
    }
    Array.prototype.forEach.call(sheet.querySelectorAll('.field'), enhanceOptionalDateField);
    enhanceAccountBackNavigation(sheet);
  }

  function sync() {
    var sheets = document.querySelectorAll('.sheet[aria-label="Sửa tài khoản"]');
    Array.prototype.forEach.call(sheets, enhanceAccountEdit);
    document.body.classList.toggle('rf-account-sheet-open', Boolean(document.querySelector('.sheet.rf-account-edit-sheet')));
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () { scheduled = false; sync(); });
  }

  var observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', schedule);
  schedule();
})();
