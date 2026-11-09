/**
 * Stand-in for the Apps Script server. The real dashboard calls its server with
 * google.script.run; this file defines a google.script.run that answers the same
 * calls from the sample data in demo-data.js, so the page itself runs unchanged.
 *
 * Saves (notes, reviews, assignments) are kept in this browser's localStorage,
 * so they survive a reload. The banner's Reset button clears them.
 */
(function () {
  const STORE_KEY = 'bar-demo:changes:v1';
  const USER_KEY = 'bar-demo:user';

  const now = new Date();
  const today = dashDayFromYMD_(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const grants = demoBuildGrants(today);
  const byCode = new Map(grants.map(g => [g.code, g]));

  // Storage can be blocked (private windows, strict settings); the demo still works without it
  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* not saved */ }
  }

  // Changes people have saved, by grant code: { notes, reviews, reviewDay, reviewer, assignments }
  const changes = read(STORE_KEY, {});
  let username = read(USER_KEY, DEMO_USERS[0].username);
  if (!DEMO_USERS.some(u => u.username === username)) username = DEMO_USERS[0].username;

  // The grant's Data-sheet row: sample values with any saved changes on top
  function dataRow(code) {
    const g = byCode.get(code);
    if (!g) return null;
    const saved = changes[code] || {};
    return {
      ...g.data,
      ...saved,
      reviews: { ...g.data.reviews, ...(saved.reviews || {}) },
      assignments: { ...g.data.assignments, ...(saved.assignments || {}) }
    };
  }

  function saveChange(code, fields) {
    changes[code] = { ...(changes[code] || {}), ...fields };
    write(STORE_KEY, changes);
  }

  const two = n => String(n).padStart(2, '0');
  const lastImport = 'Last Data Import: ' + two(now.getMonth() + 1) + '-' + two(now.getDate()) + '-' + now.getFullYear();

  // --------------------------------------------------------------------------
  // The server functions Dashboard.html calls (same names and results as
  // DashScripts.js and Code.js in the real project)
  // --------------------------------------------------------------------------
  const server = {
    getProjectData() {
      return grants.map(g => {
        const d = dataRow(g.code);
        return {
          code: g.code,
          grantName: d.grantName,
          piName: d.piName,
          department: d.department,
          ...d.assignments,
          riskLevel: d.risk,
          daysSinceLastReview: d.reviewDay === null ? 'N/A' : today - d.reviewDay,
          lastReviewer: d.reviewer,
          assistantdirectorReview: d.reviews.assistantDirector,
          unusedReview: '',
          accountantReview: d.reviews.accountant
        };
      });
    },

    dashGetGrant(code) {
      code = String(code ?? '').trim();
      if (!code) throw new Error('No grant code was given.');
      const g = byCode.get(code);
      if (!g) throw new Error(`Grant ${code} isn't in the latest BAR import.`);
      const grant = dashComputeGrant_(code, g.rows, DASH_DEFAULT_LABELS, today);
      const d = dataRow(code);
      grant.risk = d.risk;
      grant.notes = d.notes;
      grant.reviews = { assistantDirector: d.reviews.assistantDirector, accountant: d.reviews.accountant };
      grant.lastReviewer = d.reviewer;
      grant.lastReviewDay = d.reviewDay;
      grant.lastImport = lastImport;
      return grant;
    },

    dashSaveChanges(code, notes, baseNotes, reviews) {
      return save(code, notes, baseNotes, reviews, false);
    },

    dashMarkReviewed(code, notes, baseNotes, reviews) {
      return save(code, notes, baseNotes, reviews, true);
    },

    updateAssignmentsByCode(code, assignments) {
      if (!code) throw new Error('Missing code.');
      if (!byCode.has(code)) throw new Error(`Code not found: ${code}`);
      const field = name => (assignments?.[name] ?? '').toString().trim();
      const updated = {
        manager: field('manager'),
        managerEmail: field('managerEmail'),
        recipient: field('recipient'),
        recipientEmail: field('recipientEmail'),
        ccEmails: field('ccEmails')
      };
      const emailLike = s => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
      const allEmailsValid = s => !s || s.split(',').map(e => e.trim()).filter(e => e).every(emailLike);
      if (!emailLike(updated.managerEmail)) throw new Error("Manager Email doesn't look valid.");
      if (!emailLike(updated.recipientEmail)) throw new Error("Recipient Email doesn't look valid.");
      if (!allEmailsValid(updated.ccEmails)) throw new Error("One or more CC Emails don't look valid.");
      saveChange(code, { assignments: updated });
    },

    dashGetSalaryRows(code) {
      const g = byCode.get(String(code ?? '').trim());
      return g ? g.salaryRows : [];
    },

    dashGetExpenseRows(code) {
      const g = byCode.get(String(code ?? '').trim());
      return g ? g.expenseRows : [];
    },

    dashGetLaborRows(fund, organization) {
      const g = grants.find(x => x.fund === String(fund ?? '').trim() && x.org === String(organization ?? '').trim());
      return g ? g.laborRows : [];
    }
  };

  // Same rules as dashSave_() in DashScripts.js
  function save(code, notes, baseNotes, reviews, markReviewed) {
    code = String(code ?? '').trim();
    if (!code) throw new Error('Please load a grant project first.');
    const d = dataRow(code);
    if (!d) throw new Error(`No matching project "${code}" found in Data!A3:A.`);
    reviews = reviews || {};

    const merge = dashMergeNotes_(baseNotes, notes, d.notes);
    const keep = v => (v === 'Requested' ? 'Requested' : '');
    const stored = { assistantDirector: keep(reviews.assistantDirector), accountant: keep(reviews.accountant) };
    const shown = { ...stored };
    if (markReviewed && username === DEMO_ASSISTANT_DIRECTOR) {
      stored.assistantDirector = '';
      shown.assistantDirector = 'Completed';
    }
    if (markReviewed && username === DEMO_ACCOUNTANT) {
      stored.accountant = '';
      shown.accountant = 'Completed';
    }

    const fields = { notes: merge.notes, reviews: stored };
    if (markReviewed) {
      fields.reviewDay = today;
      fields.reviewer = username;
    }
    saveChange(code, fields);

    return {
      notes: merge.notes,
      mergedWithOthers: merge.merged,
      reviews: shown,
      lastReviewer: markReviewed ? username : d.reviewer,
      message: markReviewed
        ? `Project ${code} has been marked as reviewed.`
        : `Changes to project ${code} have been saved.`
    };
  }

  // --------------------------------------------------------------------------
  // google.script.run: withSuccessHandler / withFailureHandler, then a server call.
  // Like the real thing, it's asynchronous and only passes plain data both ways.
  // --------------------------------------------------------------------------
  const plain = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const delay = () => 350 + Math.random() * 450; // long enough to see the loading animation

  function runner(onSuccess, onFailure) {
    const run = {
      withSuccessHandler: fn => runner(fn, onFailure),
      withFailureHandler: fn => runner(onSuccess, fn)
    };
    Object.keys(server).forEach(name => {
      run[name] = (...args) => {
        const input = plain(args);
        setTimeout(() => {
          let result;
          try {
            result = plain(server[name](...input));
          } catch (err) {
            if (onFailure) onFailure(err);
            else console.error(err);
            return;
          }
          if (onSuccess) onSuccess(result);
        }, delay());
      };
    });
    return run;
  }

  window.google = { script: { run: runner(null, null) } };

  // --------------------------------------------------------------------------
  // Demo banner: who's signed in, and Reset
  // --------------------------------------------------------------------------
  const userSelect = document.getElementById('demo-user');
  DEMO_USERS.forEach(u => {
    const option = document.createElement('option');
    option.value = u.username;
    option.textContent = `${u.name} (${u.role})`;
    userSelect.appendChild(option);
  });
  userSelect.value = username;
  userSelect.addEventListener('change', () => {
    username = userSelect.value;
    write(USER_KEY, username);
  });

  document.getElementById('demo-reset').addEventListener('click', async () => {
    // askYesNo and state are defined by the dashboard's own script
    const ok = await askYesNo('Reset the demo? This clears every note, review and assignment change saved in this browser.');
    if (!ok) return;
    try {
      localStorage.removeItem(STORE_KEY);
    } catch (e) { /* nothing saved */ }
    state.grant = null; // skip the unsaved-changes warning; everything is being thrown away
    location.reload();
  });
})();
