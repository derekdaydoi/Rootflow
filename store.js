/* Rootflow — store.js
   Đọc ghi localStorage. Không chứa nghiệp vụ tài chính, không chứa giao diện. */
(function (global) {
  'use strict';

  var KEY = 'rootflow.data';
  var SCHEMA = 6;
  var TRASH_DAYS = 30;
  var WARN_BYTES = 3 * 1024 * 1024;
  var D = global.RootflowDomain;

  function uid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function now() { return new Date().toISOString(); }

  function empty() {
    return {
      schemaVersion: SCHEMA,
      accounts: [],
      flows: [],
      counterparties: [],
      contracts: [],
      budgets: [],
      scenarios: [],
      settings: { hardFloor: 0, operatingBuffer: 0, comfortBuffer: 0, reserveFloor: 0, horizonDays: 90 },
      updatedAt: now()
    };
  }

  function migrate(raw) {
    var data = raw;
    if (!data || typeof data !== 'object') return empty();
    if (!data.schemaVersion) data.schemaVersion = 1;
    var fromVersion = Number(data.schemaVersion) || 1;
    if (fromVersion > SCHEMA) throw new Error('Dữ liệu được tạo bởi phiên bản Rootflow mới hơn.');

    var base = empty();
    data.accounts = Array.isArray(data.accounts) ? data.accounts : [];
    data.flows = Array.isArray(data.flows) ? data.flows : [];
    data.counterparties = Array.isArray(data.counterparties) ? data.counterparties : [];
    data.contracts = Array.isArray(data.contracts) ? data.contracts : [];
    data.budgets = Array.isArray(data.budgets) ? data.budgets : [];
    data.scenarios = Array.isArray(data.scenarios) ? data.scenarios : [];
    data.settings = Object.assign({}, base.settings, data.settings || {});
    if (fromVersion < 6) {
      var legacyFloor = Math.max(0, Number(data.settings.reserveFloor) || 0);
      if (!(Number(data.settings.hardFloor) > 0)) data.settings.hardFloor = legacyFloor;
      if (!(Number(data.settings.operatingBuffer) > 0)) data.settings.operatingBuffer = legacyFloor;
      if (!(Number(data.settings.comfortBuffer) > 0)) data.settings.comfortBuffer = data.settings.operatingBuffer;
    }
    data.settings.hardFloor = Math.max(0, Number(data.settings.hardFloor) || 0);
    data.settings.operatingBuffer = Math.max(data.settings.hardFloor, Number(data.settings.operatingBuffer) || data.settings.hardFloor);
    data.settings.comfortBuffer = Math.max(data.settings.operatingBuffer, Number(data.settings.comfortBuffer) || data.settings.operatingBuffer);
    data.settings.reserveFloor = data.settings.hardFloor;

    /* Mỗi account có ngày baseline riêng. Liquid account hiểu openingBalance là
       số dư đầu kỳ và replay từ chính ngày baseline; vị thế hiện hữu như khoản vay
       dùng baseline như snapshot để tránh replay lịch sử hai lần. Với dữ liệu cũ
       thiếu ngày baseline, đặt mốc trước ngày tạo một ngày để giữ cách replay cũ. */
    data.accounts = data.accounts.map(function (a) {
      a = Object.assign({}, a || {});
      if (!a.balanceAsOf) {
        var created = String(a.createdAt || '').slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(created)) a.balanceAsOf = D.addDays(created, -1);
      }
      return a;
    });

    data.budgets = data.budgets.map(function (b) {
      return Object.assign({
        id: uid(), month: D.monthOf(D.today()), name: 'Danh mục', category: 'Khác',
        limit: 0, icon: 'wallet', createdAt: now(), updatedAt: now()
      }, b || {});
    });
    data.scenarios = data.scenarios.map(function (s) {
      return Object.assign({
        id: uid(), name: 'Kịch bản', date: D.addDays(D.today(), 30), kind: 'expense',
        amount: 0, accountId: '', counterAccountId: null, note: '', createdAt: now(), updatedAt: now()
      }, s || {});
    });

    /* V2 chỉ lưu seriesId. V3 suy ra lại tần suất và vị trí trong chuỗi để
       màn sửa có thể hiển thị và chỉnh lịch lặp. */
    var groups = {};
    data.flows.forEach(function (f) {
      if (!f || !f.seriesId) return;
      if (!groups[f.seriesId]) groups[f.seriesId] = [];
      groups[f.seriesId].push(f);
    });
    Object.keys(groups).forEach(function (id) {
      var rows = groups[id].slice().sort(function (a, b) {
        return String(a.date || '').localeCompare(String(b.date || ''));
      });
      var freq = rows[0] && (rows[0].seriesFreq === 'weekly' || rows[0].seriesFreq === 'monthly')
        ? rows[0].seriesFreq : null;
      if (!freq && rows.length > 1) {
        var gap = Math.abs(D.diffDays(rows[0].date, rows[1].date));
        freq = gap >= 26 ? 'monthly' : 'weekly';
      }
      if (!freq) freq = 'monthly';
      rows.forEach(function (f, i) {
        f.seriesFreq = f.seriesFreq === 'weekly' || f.seriesFreq === 'monthly' ? f.seriesFreq : freq;
        f.seriesIndex = Number.isFinite(Number(f.seriesIndex)) ? Number(f.seriesIndex) : i;
        f.seriesCount = Number.isFinite(Number(f.seriesCount)) && Number(f.seriesCount) > 0
          ? Number(f.seriesCount) : rows.length;
      });
    });
    data.flows.forEach(function (f) {
      if (!f || f.seriesId) return;
      f.seriesFreq = 'none';
      f.seriesIndex = 0;
      f.seriesCount = 1;
    });

    /* V6 phân biệt confidence của forecast. Legacy planned flow chỉ cho biết
       "dự kiến", không đủ bằng chứng để nâng thành CERTAIN. Actual rows được
       giữ CERTAIN vì đã xảy ra. */
    data.flows.forEach(function (f) {
      if (!f) return;
      var confidence = String(f.confidence || '').toUpperCase();
      if (!/^(CERTAIN|EXPECTED|UNCERTAIN)$/.test(confidence)) {
        confidence = f.confirmed ? 'CERTAIN' : 'EXPECTED';
      }
      f.confidence = confidence;
    });

    data.counterparties = data.counterparties.map(function (p) {
      return Object.assign({ id: uid(), name: '', note: '', createdAt: now(), updatedAt: now() }, p || {});
    }).filter(function (p) { return String(p.name || '').trim(); });

    data.contracts = data.contracts.map(function (c) {
      var type = c && c.type === 'payable' ? 'payable' : 'receivable';
      return Object.assign({
        id: uid(), type: type, counterpartyId: null, counterpartyName: '', accountId: '',
        originalPrincipal: 0, startDate: D.today(), maturityDate: null,
        interestRate: 0, interestFrequency: 'monthly', status: 'active',
        fundingSource: 'own', fundingContractId: null, note: '', createdAt: now(), updatedAt: now()
      }, c || {}, { type: type });
    });

    /* Chỉ nghĩa vụ CERTAIN mới được auto-post khi tới hạn. EXPECTED/UNCERTAIN
       phải chờ người dùng xác nhận, nếu không một khoản thu trễ sẽ làm số dư
       hiện tại an toàn giả. */
    var t = D.today();
    data.flows.forEach(function (f) {
      if (!f || f.deletedAt || f.skipped || f.confirmed) return;
      if (String(f.date || '') <= t && f.confidence === 'CERTAIN') {
        f.confirmed = true;
        f.autoPosted = true;
      }
    });

    data.schemaVersion = SCHEMA;
    return data;
  }

  function purge(data) {
    var cutoff = D.addDays(D.today(), -TRASH_DAYS);
    var before = data.flows.length;
    data.flows = data.flows.filter(function (f) {
      return !f.deletedAt || String(f.deletedAt).slice(0, 10) > cutoff;
    });
    return before !== data.flows.length;
  }

  function load() {
    var raw = null;
    try { raw = global.localStorage.getItem(KEY); }
    catch (e) { return { data: empty(), error: 'Trình duyệt đang chặn bộ nhớ cục bộ. Dữ liệu sẽ không được lưu.' }; }

    if (!raw) return { data: empty(), error: null, fresh: true };

    var parsed;
    try { parsed = JSON.parse(raw); }
    catch (e) { return { data: empty(), error: 'Dữ liệu đã lưu bị hỏng và không đọc được. Nạp lại từ bản sao lưu.' }; }

    var data;
    try { data = migrate(parsed); }
    catch (e) { return { data: empty(), error: e && e.message ? e.message : 'Không thể nâng cấp dữ liệu đã lưu.' }; }
    purge(data);
    return { data: data, error: null };
  }

  function save(data) {
    data.updatedAt = now();
    var text = JSON.stringify(data);
    try {
      global.localStorage.setItem(KEY, text);
      return { ok: true, bytes: text.length, warn: text.length > WARN_BYTES };
    } catch (e) {
      return { ok: false, bytes: text.length, error: 'Hết chỗ lưu trên máy. Xuất bản sao lưu rồi dọn bớt dữ liệu cũ.' };
    }
  }

  function persist() {
    if (global.navigator && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(function () {});
    }
  }

  /* Xoá toàn bộ dữ liệu Rootflow trên origin hiện tại.
     Bao gồm localStorage của bản đang chạy và IndexedDB Rootflow cũ. */
  function clearAll() {
    var localError = null;
    try {
      var keys = [];
      for (var i = 0; i < global.localStorage.length; i++) {
        var key = global.localStorage.key(i);
        if (key && /^rootflow(?:[.:_-]|$)/i.test(key)) keys.push(key);
      }
      keys.forEach(function (key) { global.localStorage.removeItem(key); });
    } catch (e) {
      localError = e;
    }

    function deleteDb(name) {
      return new Promise(function (resolve) {
        if (!global.indexedDB || !name) return resolve();
        var done = false;
        function finish() { if (!done) { done = true; resolve(); } }
        try {
          var req = global.indexedDB.deleteDatabase(name);
          req.onsuccess = finish;
          req.onerror = finish;
          req.onblocked = finish;
          setTimeout(finish, 1200);
        } catch (e) { finish(); }
      });
    }

    var dbNames = ['rootflow-v1', 'rootflow', 'Rootflow'];
    var discover = global.indexedDB && typeof global.indexedDB.databases === 'function'
      ? global.indexedDB.databases().then(function (rows) {
          (rows || []).forEach(function (row) {
            var name = row && row.name;
            if (name && /^rootflow/i.test(name) && dbNames.indexOf(name) < 0) dbNames.push(name);
          });
        }).catch(function () {})
      : Promise.resolve();

    return discover.then(function () {
      return Promise.all(dbNames.map(deleteDb));
    }).then(function () {
      if (localError) throw localError;
      return { ok: true };
    });
  }

  function exportFile(data) {
    var payload = {
      format: 'rootflow-backup',
      schemaVersion: data.schemaVersion,
      exportedAt: now(),
      data: {
        accounts: data.accounts,
        flows: data.flows,
        counterparties: data.counterparties || [],
        contracts: data.contracts || [],
        budgets: data.budgets || [],
        scenarios: data.scenarios || [],
        settings: data.settings
      }
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'rootflow-backup-' + D.today() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importFile(file, cb) {
    var reader = new FileReader();
    reader.onerror = function () { cb('Không đọc được tệp.'); };
    reader.onload = function () {
      var parsed;
      try { parsed = JSON.parse(String(reader.result)); }
      catch (e) { return cb('Tệp không phải JSON hợp lệ.'); }
      if (!parsed || parsed.format !== 'rootflow-backup') return cb('Tệp này không phải bản sao lưu Rootflow.');
      var d = migrate(Object.assign({ schemaVersion: parsed.schemaVersion }, parsed.data));
      if (!Array.isArray(d.accounts) || !Array.isArray(d.flows)) return cb('Bản sao lưu thiếu dữ liệu.');
      cb(null, d);
    };
    reader.readAsText(file);
  }


  global.RootflowStore = {
    KEY: KEY, SCHEMA: SCHEMA, TRASH_DAYS: TRASH_DAYS,
    uid: uid, now: now, empty: empty, load: load, save: save, persist: persist,
    clearAll: clearAll, exportFile: exportFile, importFile: importFile
  };
})(window);
