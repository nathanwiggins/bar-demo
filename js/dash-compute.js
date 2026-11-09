/**
 * Budget math for the demo: copied unchanged from DashScripts.js in the real
 * project (commit cb52669), lines 13-20 and 34-395. These functions are pure
 * JavaScript, so the demo computes every figure and status with the same code
 * the production dashboard runs on its server.
 */

// CSV (BAR import) sheet columns, 0-based
const DASH_BAR = {
  CODE: 0, TITLE: 1, START: 2, END: 3, PI_NAME: 4, PI_TNUMBER: 5,
  ACCT_TITLE: 8, INDEX: 11, INDEX_FUND: 12, INDEX_ORG: 13, ACCT_CODE: 14,
  BUDGET: 16, ACTIVITY: 17, ENCUMBRANCE: 18, ORG: 20, DEPARTMENT: 21, FUND: 22,
  SUMMARY_GROUP: 23
};
const DASH_BAR_WIDTH = 24; // A:X

// ==========================================================================
// Calculations: the Dashboard tab's formulas, cell by cell.
// Pure JavaScript (no Apps Script services) so they can be tested anywhere.
// Dates are whole-day numbers (days since 1970-01-01); null means a blank cell.
// ==========================================================================

// Status labels from the Dropdowns sheet (B2:E4); index 0 = Level 1 (green) ... 2 = Level 3 (red)
const DASH_DEFAULT_LABELS = {
  burn: ['Normal Spending Rate', 'Deviating Spending Rate', 'Problematic Spending Rate'],
  endDate: ['No Upcoming End Date', 'On Track for End Date', 'Off Track for End Date'],
  compliance: ['No Concerns', 'Overspending Notification', 'Overspending Alert'],
  balance: ['Normal Balances', 'Possible Invoicing', 'Low Spending Balance']
};

// Budget categories (Dashboard rows 14-19), by account code (CSV column O)
const DASH_CATEGORIES = [
  { key: 'salaries', label: 'Salaries and Wages', test: c => c >= 6000 && c < 6300 },
  { key: 'fringe',   label: 'Fringe Benefits',    test: c => c >= 6300 && c < 7049 },
  { key: 'expense',  label: 'Current Expense',    test: c => c >= 7049 && c < 7500 },
  { key: 'travel',   label: 'Travel',             test: c => c >= 7500 && c < 7600 },
  { key: 'indirect', label: 'Indirect Costs',     test: c => c === 7980 },
  { key: 'other',    label: 'Other',              test: c => c >= 7600 && c !== 7980 }
];

// A blank date cell counts as 0 (12/30/1899) in sheet date math
const DASH_SHEET_ZERO_DAY = -25569;

// Thrown where the sheet formula would show an error such as #VALUE!
function DashSheetError_(code) {
  this.code = code;
}

function dashDayFromYMD_(y, m, d) {
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

function dashYMD_(day) {
  const date = new Date(day * 86400000);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

// TEXT(date, "mm/dd/yy")
function dashFormatShortDate_(day) {
  const p = dashYMD_(day);
  const two = n => String(n).padStart(2, '0');
  return two(p.m) + '/' + two(p.d) + '/' + two(p.y % 100);
}

// Numbers the way SUM sees them: blanks and text count as 0
function dashNum_(v) {
  if (typeof v === 'number') return v;
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

// Account codes compare as numbers; a blank code counts as 0
function dashAcctCode_(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return isFinite(n) ? n : NaN;
}

// ABS(a - b) where either side may be "" (text) -> #VALUE!
function dashAbsDiff_(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') throw new DashSheetError_('#VALUE!');
  return Math.abs(a - b);
}

// a > b with sheet rules: text ("") is greater than any number
function dashGreater_(a, b) {
  if (typeof a === 'string' && typeof b === 'number') return true;
  if (typeof a === 'number' && typeof b === 'string') return false;
  return a > b;
}

// F4: semi-monthly pay dates (every 15 days from the 15th of this month) left before the end date
function dashPayDatesToEnd_(today, endDay) {
  const t = dashYMD_(today);
  const e = dashYMD_(endDay === null ? DASH_SHEET_ZERO_DAY : endDay);
  const n = (e.y - t.y) * 24 + (e.m - t.m) * 2 + 2;
  if (n <= 0) return 0;
  const end = endDay === null ? DASH_SHEET_ZERO_DAY : endDay;
  const first = dashDayFromYMD_(t.y, t.m, 1) - 1 + 15; // EOMONTH(TODAY(),-1)+15
  let count = 0;
  for (let k = 0; k < n; k++) {
    const d = first + 15 * k;
    if (d >= today && d <= end) count++;
  }
  return count;
}

// F5: pay dates (15th and month end) left before the fiscal year ends on June 30
function dashPayDatesToFiscalYearEnd_(today) {
  const t = dashYMD_(today);
  const fiscalYearEnd = dashDayFromYMD_(t.m <= 6 ? t.y : t.y + 1, 6, 30);
  let count = 0;
  for (let i = 0; i < 12; i++) {
    const mid = dashDayFromYMD_(t.y, t.m + i, 15);
    const monthEnd = dashDayFromYMD_(t.y, t.m + i + 1, 1) - 1;
    if (mid >= today && mid <= fiscalYearEnd) count++;
    if (monthEnd >= today && monthEnd <= fiscalYearEnd) count++;
  }
  return count;
}

// H6 / H8: "09/01/22 (1504 days ago)"
function dashDateWithDays_(day, today) {
  if (day === null) return '';
  const days = today - day;
  return dashFormatShortDate_(day) + ' (' + Math.abs(days) + ' days ' + (days > 0 ? 'ago' : 'away') + ')';
}

function dashFormatCurrency_(n) {
  const sign = n < 0 ? '-' : '';
  const fixed = Math.abs(n).toFixed(2).split('.');
  return sign + '$' + fixed[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + fixed[1];
}

function dashStatus_(labels, level, detail) {
  return { label: labels[level - 1], level: level, detail: detail, error: null };
}

/**
 * Everything the Dashboard tab shows for one grant (except Data-sheet fields like
 * risk level and notes, which the caller adds).
 *   rows   - the grant's CSV rows (arrays, columns per DASH_BAR) with START/END as day numbers
 *   labels - status labels from the Dropdowns sheet (DASH_DEFAULT_LABELS shape)
 *   today  - today's day number in the spreadsheet's time zone
 */
function dashComputeGrant_(code, rows, labels, today) {
  labels = labels || DASH_DEFAULT_LABELS;
  const first = rows[0] || [];
  const startDay = first[DASH_BAR.START] === undefined ? null : first[DASH_BAR.START];
  const endDay = first[DASH_BAR.END] === undefined ? null : first[DASH_BAR.END];
  const start = startDay === null ? DASH_SHEET_ZERO_DAY : startDay;
  const end = endDay === null ? DASH_SHEET_ZERO_DAY : endDay;
  const fund = first[DASH_BAR.FUND] ?? '';
  const organization = first[DASH_BAR.ORG] ?? '';

  // E6: first index on a row matching the grant's fund and organization
  const indexRow = rows.find(r =>
    String(r[DASH_BAR.INDEX_FUND]) === String(fund) &&
    String(r[DASH_BAR.INDEX_ORG]) === String(organization) &&
    r[DASH_BAR.INDEX] !== '' && r[DASH_BAR.INDEX] !== null);

  // F4 < F5: the grant ends before the fiscal year does, so salary encumbrances are prorated
  const payDatesToEnd = dashPayDatesToEnd_(today, endDay);
  const payDatesToFiscalYearEnd = dashPayDatesToFiscalYearEnd_(today);
  const prorateSalary = payDatesToEnd < payDatesToFiscalYearEnd;

  const sumWhere = (col, test) => rows.reduce((sum, r) => {
    const acct = dashAcctCode_(r[DASH_BAR.ACCT_CODE]);
    return test(acct) ? sum + dashNum_(r[col]) : sum;
  }, 0);

  const buildRow = (key, label, test, hasBar) => {
    const budget = sumWhere(DASH_BAR.BUDGET, test);
    const activity = sumWhere(DASH_BAR.ACTIVITY, test);
    let encumbrance = sumWhere(DASH_BAR.ENCUMBRANCE, test);
    if (key === 'salaries' && prorateSalary) encumbrance = payDatesToEnd / payDatesToFiscalYearEnd * encumbrance;
    const available = budget - activity - encumbrance;
    return {
      key: key,
      label: label,
      budget: budget,
      activity: activity,
      encumbrance: encumbrance,
      available: available,
      // H13:H19 = IF(C<0, "", IFERROR(D/C, ""))
      burnRate: budget < 0 || budget === 0 ? null : activity / budget,
      // G14:G19 sparkline = MAX(F/C, 0), drawn up to 1
      barFill: hasBar && budget !== 0 ? Math.min(Math.max(available / budget, 0), 1) : null
    };
  };

  const revenue = buildRow('revenue', 'Revenue', c => c < 6000, true);
  const categories = DASH_CATEGORIES.map(cat => buildRow(cat.key, cat.label, cat.test, true));
  const budget = categories.reduce((s, r) => s + r.budget, 0);
  const activity = categories.reduce((s, r) => s + r.activity, 0);
  const encumbrance = categories.reduce((s, r) => s + r.encumbrance, 0);
  const total = {
    key: 'total',
    label: 'Total',
    budget: budget,
    activity: activity,
    encumbrance: encumbrance,
    available: budget - activity - encumbrance,
    burnRate: budget === 0 ? null : activity / budget, // H20 = IFERROR(D20/C20, "")
    barFill: budget !== 0 ? Math.min(Math.max((budget - activity - encumbrance) / budget, 0), 1) : null
  };

  // H22 / H24
  const availableSpending = Math.max(total.available, 0) + total.encumbrance;
  const invoiceable = Math.max(Math.min(total.activity, total.budget) - revenue.activity, 0);

  // A23: QUERY(... WHERE activity <> 0 GROUP BY title, column X, code ORDER BY code)
  const groups = {};
  rows.forEach(r => {
    const amount = dashNum_(r[DASH_BAR.ACTIVITY]);
    if (amount === 0) return;
    const name = r[DASH_BAR.ACCT_TITLE] ?? '';
    const code = r[DASH_BAR.ACCT_CODE] ?? '';
    const key = [name, r[DASH_BAR.SUMMARY_GROUP] ?? '', code].join('\u0001');
    if (!groups[key]) groups[key] = { name: String(name), code: code, amount: 0 };
    groups[key].amount += amount;
  });
  const ledger = Object.keys(groups).map(k => groups[k]).sort((a, b) =>
    (dashAcctCode_(a.code) - dashAcctCode_(b.code)) || a.name.localeCompare(b.name));
  ledger.forEach(line => {
    const acct = dashAcctCode_(line.code);
    const cat = DASH_CATEGORIES.find(c => c.test(acct));
    line.category = acct < 6000 || !cat ? 'revenue' : cat.key;
  });

  // H10 and the completion rate used inside the status formulas
  const elapsed = today - start;           // DAYS(NOW(), F8)
  const duration = end - start;            // DAYS(F9, F8)
  const completionRate = endDay === null || duration === 0 ? null : Math.min(elapsed / duration, 1);
  const completionForStatus = () => {
    if (duration === 0) throw new DashSheetError_('#DIV/0!');
    return Math.min(elapsed / duration, 1);
  };
  const burnTotal = total.burnRate === null ? '' : total.burnRate; // H20, "" when blank
  const daysLeft = end - today;            // DAYS(F9, NOW())

  const safeStatus = fn => {
    try {
      return fn();
    } catch (e) {
      if (e instanceof DashSheetError_) return { label: null, level: null, detail: null, error: e.code };
      throw e;
    }
  };

  // F27 / F29
  const burn = safeStatus(() => {
    const L = labels.burn;
    if (elapsed >= 90 && total.activity === 0) return dashStatus_(L, 3, 'No expenditures recorded 90+ days into the grant');
    if (elapsed < Math.min(duration * 0.25, 90)) return dashStatus_(L, 1, 'Spending rate is not evaluated during the early periods of the project');
    const diff = dashAbsDiff_(completionForStatus(), burnTotal);
    if (diff <= 0.1 || endDay === null) return dashStatus_(L, 1, 'No concerns');
    if (diff <= 0.25 || endDay === null) return dashStatus_(L, 2, 'Spending rate and grant completion rate are slightly misaligned (differ by more than 10%)');
    return dashStatus_(L, 3, 'Spending rate and grant completion rate are significantly misaligned (differ by more than 25%)');
  });

  // F32 / F34
  const endDateStatus = safeStatus(() => {
    const L = labels.endDate;
    if (daysLeft >= 90 || endDay === null) return dashStatus_(L, 1, 'No concerns');
    const diff = dashAbsDiff_(completionForStatus(), burnTotal);
    const pick = (ok, onTrack, offTrack) => dashStatus_(L, ok ? 2 : 3, ok ? onTrack : offTrack);
    if (daysLeft <= 0) {
      return pick(diff <= 0.05,
        'Project has ended and there are no concerns',
        'Project has ended and there are financial details that still need to be addressed');
    }
    if (daysLeft <= 30) {
      return pick(diff <= 0.07,
        'Project ends within 30 days and project spending rate is on track',
        'Project ends within 30 days and project spending rate may be off track');
    }
    if (daysLeft <= 60) {
      return pick(diff <= 0.085,
        'Project ends within 60 days and project spending rate is on track',
        'Project ends within 60 days and project spending rate may be off track');
    }
    return pick(diff <= 0.1,
      'Project ends within 90 days and project spending rate is on track',
      'Project ends within 90 days and project spending rate may be off track');
  });

  // F37 / F39. The explanation checks Total available < 0; the status checks burn rate > 100%.
  const overLimit = categories.some(r => r.available < -0.1 * total.budget);
  const unbudgeted = categories.some(r => r.budget === 0 && r.activity > 0);
  const overspent = categories.some(r => r.available < 0);
  const compliance = (() => {
    const L = labels.compliance;
    let detail = 'No concerns';
    if (total.available < 0) detail = 'Overall project is overspent and needs to be resolved';
    else if (overLimit) detail = 'One or more budget category is overspent by more than 10% (the allowable limit) of the overall budget';
    else if (unbudgeted) detail = 'Expenses are present in a category with no initial budget allocation';
    else if (overspent) detail = 'One or more budget category is overspent but the overage is within 10% (the allowable limit) of the overall budget';
    let level = 1;
    if (dashGreater_(burnTotal, 1) || overLimit || unbudgeted) level = 3;
    else if (overspent) level = 2;
    return { label: L[level - 1], level: level, detail: detail, error: null };
  })();

  // F42 / F44
  const balance = (() => {
    const L = labels.balance;
    if (availableSpending > total.budget * 0.05 && invoiceable < total.budget * 0.1) return dashStatus_(L, 1, 'No concerns');
    if (availableSpending <= total.budget * 0.05) return dashStatus_(L, 3, 'Explanation: Less than 5% of the original budget is available for spending');
    return dashStatus_(L, 2, 'Explanation: Potential invoiceable amount for the next invoicing cycle identified');
  })();

  const salaryEncumbrance = sumWhere(DASH_BAR.ENCUMBRANCE, DASH_CATEGORIES[0].test);

  return {
    code: code,
    title: first[DASH_BAR.TITLE] ?? '',
    piName: first[DASH_BAR.PI_NAME] ?? '',
    piTNumber: first[DASH_BAR.PI_TNUMBER] ?? '',
    department: first[DASH_BAR.DEPARTMENT] ?? '',
    index: indexRow ? indexRow[DASH_BAR.INDEX] : '',
    fund: fund,
    organization: organization,
    startDay: startDay,
    endDay: endDay,
    startText: dashDateWithDays_(startDay, today),
    endText: dashDateWithDays_(endDay, today),
    completionRate: completionRate,
    encumbranceLabel: prorateSalary ? 'Encumbrances*' : 'Encumbrances',
    encumbranceNote: prorateSalary
      ? '*Salary encumbrances have been adjusted to show just until the end of the grant year to more accurately reflect committed payroll. The actual amount committed in Banner until the end of the fiscal year is ' + dashFormatCurrency_(salaryEncumbrance)
      : '',
    accounts: [revenue].concat(categories),
    total: total,
    ledger: ledger,
    availableSpending: availableSpending,
    invoiceable: invoiceable,
    statuses: { burn: burn, endDate: endDateStatus, compliance: compliance, balance: balance }
  };
}

/**
 * Combine notes when someone else saved this grant after we loaded it.
 * Starts from their text, drops lines we deleted, and adds lines we wrote.
 *   base   - notes as they were when we loaded the grant
 *   mine   - notes we're saving now
 *   theirs - notes currently in the Data sheet
 */
function dashMergeNotes_(base, mine, theirs) {
  base = String(base ?? '');
  mine = String(mine ?? '');
  theirs = String(theirs ?? '');
  if (theirs === base) return { notes: mine, merged: false };
  if (mine === base) return { notes: theirs, merged: false };

  const lines = text => text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  const minus = (a, b) => {
    const left = b.slice();
    return a.filter(item => {
      const i = left.indexOf(item);
      if (i === -1) return true;
      left.splice(i, 1);
      return false;
    });
  };
  const removed = minus(lines(base), lines(mine));
  const added = minus(lines(mine), lines(base));

  const result = theirs.split(/\r?\n/);
  removed.forEach(line => {
    const i = result.findIndex(l => l.trim() === line);
    if (i !== -1) result.splice(i, 1);
  });
  const present = lines(result.join('\n'));
  minus(added, present).forEach(line => result.push(line));
  return { notes: result.join('\n').replace(/\s+$/, ''), merged: true };
}
