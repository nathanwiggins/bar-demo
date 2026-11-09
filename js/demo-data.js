/**
 * Sample data for the demo. Every grant, person, account and dollar amount here
 * is made up.
 *
 * Dates are days relative to the day the page is opened (start: -400 means the
 * grant started 400 days ago), so each grant shows the same situation no matter
 * when the demo is viewed. The comment above each grant says what it's there to show.
 */

// People who can "sign in" to the demo (the banner's Signed in as menu)
const DEMO_USERS = [
  { username: 'jordanlee', name: 'Jordan Lee', role: 'Grant Manager' },
  { username: 'danawhitfield', name: 'Dana Whitfield', role: 'Assistant Director' },
  { username: 'marcusbell', name: 'Marcus Bell', role: 'SPARC Accountant' }
];
// Mark Project as Reviewed completes these people's requested reviews (like the real app)
const DEMO_ASSISTANT_DIRECTOR = 'danawhitfield';
const DEMO_ACCOUNTANT = 'marcusbell';

const DEMO_MANAGERS = {
  lee: { manager: 'Jordan Lee', managerEmail: 'jordanlee@example.edu' },
  natarajan: { manager: 'Priya Natarajan', managerEmail: 'priyanatarajan@example.edu' },
  okafor: { manager: 'Tom Okafor', managerEmail: 'tomokafor@example.edu' },
  none: { manager: '', managerEmail: '' }
};

// Accounts used for each budget category, with how the category's budget is split between them
const DEMO_ACCOUNTS = {
  salaries: [[6110, 'Faculty Salaries', 0.55], [6140, 'Staff Salaries', 0.3], [6210, 'Student Wages', 0.15]],
  fringe: [[6310, 'Benefits - Faculty & Staff', 0.85], [6350, 'Benefits - Hourly & Student', 0.15]],
  expense: [[7150, 'Research Supplies', 0.45], [7240, 'Computer Equipment Under $5,000', 0.2],
    [7310, 'Professional Services', 0.25], [7420, 'Printing & Publication', 0.1]],
  travel: [[7510, 'In-State Travel', 0.4], [7520, 'Out-of-State Travel', 0.6]],
  other: [[7710, 'Participant Support Costs', 1], [7810, 'Subaward Expenses', 1]],
  indirect: [[7980, 'Indirect Costs', 1]]
};
const DEMO_REVENUE_ACCOUNTS = {
  federal: [5110, 'Federal Grants & Contracts'],
  state: [5210, 'State Grants & Contracts'],
  private: [5310, 'Private Gifts, Grants & Contracts']
};
const DEMO_SUMMARY_GROUPS = {
  revenue: 'Revenue', salaries: 'Salaries and Wages', fringe: 'Fringe Benefits', expense: 'Current Expense',
  travel: 'Travel', other: 'Other', indirect: 'Indirect Costs'
};

/*
 * One entry per grant:
 *   budget      - budget per category, in dollars
 *   spent       - share of each budget spent (a number, or per category with `rest` as the default)
 *   encumbered  - share of each budget encumbered (same shape)
 *   billed      - share of spending already invoiced to the sponsor (Revenue activity)
 *   accounts    - which accounts a category uses, when not all of them
 *   unbudgeted  - [account, amount] spending on an account with no budget
 *   notes       - [days ago, text]; the date is added to the front of each comment
 *   review      - [days ago, username] of the last review, or null if never reviewed
 *   staff       - [name, T-number, job title, pay type, paid in the last 30 days (null = none), account, labor %]
 *   expenses    - [days ago, account, description, amount, document number] in the last 30 days
 */
const DEMO_GRANTS = [
  // Healthy: spending matches time elapsed, invoices are current
  {
    code: 'F24104718', title: 'Undergraduate Research Experience in Desert Ecology',
    pi: 'Alvarez, Maria', tNumber: 'T00418827', department: 'Biology', sponsor: 'federal',
    fund: '214718', org: '31110', index: 'GR4718', start: -400, end: 330,
    budget: { salaries: 96500, fringe: 31845, expense: 18200, travel: 9600, other: 54000, indirect: 41280 },
    accounts: { other: [7710] },
    spent: 0.52, encumbered: { salaries: 0.2, fringe: 0.2, expense: 0.03, rest: 0 }, billed: 0.94,
    risk: 'Low', manager: 'lee', cc: 'biology@example.edu',
    review: [34, 'jordanlee'],
    notes: [[210, 'Annual progress report submitted to the sponsor. No budget concerns.'],
      [34, 'Reviewed with PI. Participant stipends for the fall cohort posted as expected.']],
    staff: [['Maria Alvarez', 'T00418827', 'Associate Professor', 'Salaries', 4812.50, 6110, 0.25],
      ['Ben Carrow', 'T00593310', 'Research Coordinator', 'Salaries', 3950.00, 6140, 0.5],
      ['Isabel Romero', 'T00687142', 'Undergraduate Researcher', 'Wages', 1184.00, 6210, 1]],
    expenses: [[4, 7150, 'Field sampling kits and specimen vials', 1286.40, 'P0026114'],
      [11, 7520, 'Airfare - student presentations at regional ecology meeting', 1148.60, 'I0091823'],
      [17, 7710, 'Participant stipends - fall research cohort', 9000.00, 'J0048211'],
      [23, 7240, 'Rugged field tablets (2)', 1398.00, 'P0026051']]
  },

  // Project Burn Rate red: 68% of the time gone, 36% of the budget spent
  {
    code: 'F23087205', title: 'Rural Watershed Water Quality Monitoring Network',
    pi: 'Whitaker, Daniel', tNumber: 'T00377410', department: 'Geosciences', sponsor: 'federal',
    fund: '207205', org: '32140', index: 'GR7205', start: -500, end: 230,
    budget: { salaries: 142000, fringe: 46860, expense: 61500, travel: 12400, indirect: 78940 },
    spent: 0.36, encumbered: { salaries: 0.12, fringe: 0.12, expense: 0.05, rest: 0 }, billed: 0.92,
    risk: 'High', manager: 'none', cc: 'geosciences@example.edu',
    reviews: { assistantDirector: 'Requested' },
    review: [118, 'danawhitfield'],
    notes: [[150, 'PI reports the field season was delayed by late snowpack. Sampling resumes in June.'],
      [118, 'Asked PI for a revised spending plan before the next review.']],
    staff: [['Daniel Whitaker', 'T00377410', 'Professor', 'Salaries', 3120.00, 6110, 0.2],
      ['Hannah Pryor', 'T00610298', 'Lab Technician', 'Wages', 1690.50, 6210, 0.75]],
    expenses: [[6, 7150, 'Water chemistry reagents', 842.17, 'P0026190'],
      [19, 7310, 'Sample analysis - outside lab', 2275.00, 'I0091577']]
  },

  // Project Burn Rate yellow: spending a little behind the timeline
  {
    code: 'F24112930', title: 'Gut Microbiome and Metabolic Health in Adolescents',
    pi: 'Okonkwo, Grace', tNumber: 'T00402265', department: 'Kinesiology', sponsor: 'federal',
    fund: '212930', org: '33210', index: 'GR2930', start: -300, end: 430,
    budget: { salaries: 118400, fringe: 39072, expense: 46300, travel: 6800, other: 25000, indirect: 61540 },
    accounts: { other: [7810] },
    spent: 0.27, encumbered: { salaries: 0.25, fringe: 0.25, other: 0.3, rest: 0 }, billed: 0.97,
    risk: 'Moderate', manager: 'natarajan', cc: 'kinesiology@example.edu',
    review: [61, 'priyanatarajan'],
    notes: [[61, 'Subaward with the partner hospital was finally executed. Expect spending to pick up.']],
    staff: [['Grace Okonkwo', 'T00402265', 'Assistant Professor', 'Salaries', 3604.17, 6110, 0.3],
      ['Luis Ferreira', 'T00655871', 'Graduate Research Assistant', 'Wages', 1450.00, 6210, 1]],
    expenses: [[9, 7150, 'Stool sample collection kits (120)', 3480.00, 'P0026172'],
      [21, 7420, 'Participant recruitment flyers', 214.35, 'I0091640']]
  },

  // Financial Compliance yellow: Travel is overspent, but by less than 10% of the whole budget
  {
    code: 'F25030466', title: 'Community Mural and Public Art Program',
    pi: 'Castellanos, Rosa', tNumber: 'T00451903', department: 'Art & Design', sponsor: 'state',
    fund: '230466', org: '35120', index: 'GR0466', start: -220, end: 145,
    budget: { salaries: 14000, fringe: 1120, expense: 22600, travel: 3500, indirect: 4780 },
    accounts: { salaries: [6210], fringe: [6350] },
    spent: { travel: 1.38, rest: 0.6 }, encumbered: { expense: 0.06, rest: 0 }, billed: 0.96,
    risk: 'Low', manager: 'okafor', cc: 'artdesign@example.edu',
    reviews: { accountant: 'Requested' },
    review: [12, 'tomokafor'],
    notes: [[12, 'Travel is over budget after the artist residency trip. Asked the department to move funds from supplies.']],
    staff: [['Mateo Silva', 'T00702214', 'Student Muralist', 'Wages', 912.00, 6210, 1],
      ['Avery Collins', 'T00698836', 'Student Muralist', 'Wages', 744.00, 6210, 1]],
    expenses: [[3, 7150, 'Exterior acrylic paint and primer', 1621.88, 'P0026201'],
      [14, 7520, 'Artist residency travel - lodging', 1288.00, 'I0091702'],
      [26, 7150, 'Scaffolding rental', 950.00, 'I0091544']]
  },

  // Several red indicators: overspent overall, ending within 60 days, little balance left
  {
    code: 'F23065381', title: 'Teacher Preparation Pathways Partnership',
    pi: 'Brennan, Patrick', tNumber: 'T00329958', department: 'Teacher Education', sponsor: 'federal',
    fund: '205381', org: '34110', index: 'GR5381', start: -685, end: 45,
    budget: { salaries: 210000, fringe: 69300, expense: 38000, travel: 15000, other: 120000, indirect: 34700 },
    accounts: { other: [7710] },
    spent: { salaries: 1.12, fringe: 1.1, expense: 0.9, travel: 0.85, other: 1, indirect: 1.06 },
    encumbered: { salaries: 0.03, fringe: 0.03, rest: 0 }, billed: 0.97,
    risk: 'High', manager: 'lee', cc: 'education@example.edu',
    reviews: { assistantDirector: 'Requested' },
    review: [96, 'jordanlee'],
    notes: [[140, 'Summer stipends were paid from the salaries line. Budget revision requested from the sponsor.'],
      [96, 'Sponsor has not approved the revision yet. Follow up in 30 days.']],
    staff: [['Patrick Brennan', 'T00329958', 'Professor', 'Salaries', 5208.33, 6110, 0.4],
      ['Nina Volkov', 'T00512267', 'Program Coordinator', 'Salaries', 4100.00, 6140, 1],
      ['Caleb Ortiz', 'T00671190', 'Student Mentor', 'Wages', 860.00, 6210, 1]],
    expenses: [[8, 7710, 'Teacher candidate stipends - fall cohort', 12000.00, 'J0048290'],
      [16, 7510, 'Mileage - partner school site visits', 412.80, 'I0091688']]
  },

  // End Date Alerts yellow: ends within 30 days and spending is on track
  {
    code: 'F23070912', title: 'Small Business Export Assistance Program',
    pi: 'Nguyen, Kevin', tNumber: 'T00388104', department: 'Business Administration', sponsor: 'state',
    fund: '220912', org: '36150', index: 'GR0912', start: -712, end: 18,
    budget: { salaries: 64000, fringe: 21120, expense: 9800, travel: 7500, indirect: 10240 },
    spent: 0.935, encumbered: { salaries: 0.03, fringe: 0.03, rest: 0 }, billed: 0.95,
    risk: 'Moderate', manager: 'natarajan', cc: 'business@example.edu',
    review: [20, 'priyanatarajan'],
    notes: [[20, 'Closeout checklist sent to the PI. Final invoice is due 90 days after the end date.']],
    staff: [['Kevin Nguyen', 'T00388104', 'Associate Professor', 'Salaries', 2650.00, 6110, 0.2],
      ['Rachel Dunn', 'T00547719', 'Export Advisor', 'Salaries', 2980.00, 6140, 0.6]],
    expenses: [[5, 7420, 'Workshop handbooks', 386.25, 'I0091811'],
      [13, 7510, 'Client site visits - mileage', 228.48, 'I0091735']]
  },

  // End Date Alerts red: ends within 60 days with a quarter of the budget unspent; sponsor not billed
  {
    code: 'F23059944', title: 'Wildfire Smoke Exposure and Respiratory Health Study',
    pi: 'Halvorsen, Erik', tNumber: 'T00364471', department: 'Public Health', sponsor: 'federal',
    fund: '209944', org: '33420', index: 'GR9944', start: -680, end: 50,
    budget: { salaries: 88000, fringe: 29040, expense: 52500, travel: 8000, indirect: 49480 },
    spent: 0.72, encumbered: { salaries: 0.04, fringe: 0.04, expense: 0.05, rest: 0 }, billed: 0.8,
    risk: 'High', manager: 'okafor', cc: 'publichealth@example.edu',
    reviews: { accountant: 'Requested' },
    review: [41, 'tomokafor'],
    notes: [[41, 'PI plans to request a no-cost extension. Waiting on sponsor guidance.']],
    staff: [['Erik Halvorsen', 'T00364471', 'Associate Professor', 'Salaries', 2933.33, 6110, 0.2],
      ['Tessa Morgan', 'T00630945', 'Field Research Assistant', 'Wages', 1312.00, 6210, 0.5]],
    expenses: [[2, 7150, 'Portable air quality monitors', 2196.00, 'P0026218'],
      [18, 7310, 'Spirometry equipment calibration', 640.00, 'I0091655']]
  },

  // Ended 20 days ago with money left and payroll still encumbered
  {
    code: 'F22041187', title: 'Regional Pioneer Archives Digitization Project',
    pi: 'Delacroix, Amelie', tNumber: 'T00295536', department: 'History', sponsor: 'private',
    fund: '241187', org: '37130', index: 'GR1187', start: -760, end: -20,
    budget: { salaries: 42000, fringe: 9240, expense: 31800, travel: 2400, indirect: 8540 },
    accounts: { salaries: [6140, 6210], fringe: [6310] },
    spent: 0.88, encumbered: { salaries: 0.04, rest: 0 }, billed: 0.85,
    risk: 'High', manager: 'okafor', cc: 'history@example.edu',
    review: [45, 'marcusbell'],
    notes: [[25, 'Grant has ended. Final invoice from the scanning vendor is still pending.'],
      [8, 'Payroll is still encumbered past the end date. Asked HR to end the assignment.']],
    staff: [['Owen Pratt', 'T00588023', 'Archives Technician', 'Wages', null, 6140, 1]],
    expenses: []
  },

  // Just started: the burn rate isn't judged yet; never reviewed
  {
    code: 'F26008835', title: 'High-Altitude Balloon Research Program',
    pi: 'Tanaka, Hiro', tNumber: 'T00441187', department: 'Physics', sponsor: 'federal',
    fund: '218835', org: '32210', index: 'GR8835', start: -40, end: 690,
    budget: { salaries: 22000, fringe: 1760, expense: 18500, travel: 4200, indirect: 5040 },
    accounts: { salaries: [6210], fringe: [6350] },
    spent: 0.03, encumbered: { salaries: 0.4, fringe: 0.4, expense: 0.08, rest: 0 }, billed: 0,
    risk: 'Low', manager: 'lee', cc: 'physics@example.edu',
    review: null,
    notes: [],
    staff: [['Sofia Reyes', 'T00715508', 'Student Payload Engineer', 'Wages', 528.00, 6210, 1],
      ['Ethan Kim', 'T00719963', 'Student Flight Technician', 'Wages', 396.00, 6210, 1]],
    expenses: [[10, 7150, 'Latex sounding balloons and helium', 618.40, 'P0026177']]
  },

  // Project Burn Rate red: nothing spent 120 days in
  {
    code: 'F25119042', title: 'Native Plant Seed Bank Restoration Initiative',
    pi: 'Sorensen, Kari', tNumber: 'T00422590', department: 'Agriculture & Plant Science', sponsor: 'federal',
    fund: '219042', org: '32350', index: 'GR9042', start: -120, end: 610,
    budget: { salaries: 48000, fringe: 15840, expense: 26000, travel: 5500, indirect: 22830 },
    spent: 0, encumbered: 0, billed: 0,
    risk: 'Moderate', manager: 'natarajan', cc: 'agriculture@example.edu',
    review: [98, 'priyanatarajan'],
    notes: [[98, 'Award setup complete. PI expects to hire a field technician this fall.']],
    staff: [],
    expenses: []
  },

  // Administrative Details yellow: spending hasn't been invoiced to the sponsor
  {
    code: 'F24090316', title: 'Rural Health Workforce Training Program',
    pi: 'Adeyemi, Tolu', tNumber: 'T00396652', department: 'Nursing', sponsor: 'state',
    fund: '210316', org: '33240', index: 'GR0316', start: -365, end: 365,
    budget: { salaries: 76000, fringe: 25080, expense: 14200, travel: 9800, other: 30000, indirect: 15510 },
    accounts: { other: [7710] },
    spent: 0.48, encumbered: { salaries: 0.22, fringe: 0.22, rest: 0 }, billed: 0.55,
    risk: 'Low', manager: 'natarajan', cc: 'nursing@example.edu',
    reviews: { accountant: 'Requested' },
    review: [27, 'jordanlee'],
    notes: [[27, 'The September invoice was never submitted. Asked the accountant to bill the sponsor.']],
    staff: [['Tolu Adeyemi', 'T00396652', 'Associate Professor', 'Salaries', 2375.00, 6110, 0.25],
      ['Megan Shaw', 'T00566124', 'Clinical Placement Coordinator', 'Salaries', 3210.00, 6140, 0.75]],
    expenses: [[7, 7710, 'Rural clinical rotation stipends', 4500.00, 'J0048302'],
      [15, 7510, 'Clinical site visits - mileage', 336.96, 'I0091760'],
      [24, 7150, 'Simulation lab supplies', 712.43, 'P0026139']]
  },

  // Financial Compliance red: travel charged to a grant with no travel budget
  {
    code: 'F25026671', title: 'K-12 Cybersecurity Education Outreach',
    pi: 'Fischer, Laura', tNumber: 'T00433019', department: 'Computer Science', sponsor: 'federal',
    fund: '216671', org: '32420', index: 'GR6671', start: -260, end: 470,
    budget: { salaries: 61000, fringe: 20130, expense: 34800, other: 18000, indirect: 41530 },
    accounts: { other: [7710] },
    unbudgeted: [[7520, 2318.64]],
    spent: 0.33, encumbered: { salaries: 0.18, fringe: 0.18, rest: 0 }, billed: 0.93,
    risk: 'Moderate', manager: 'okafor', cc: 'computerscience@example.edu',
    reviews: { assistantDirector: 'Requested' },
    review: [15, 'tomokafor'],
    notes: [[15, 'Conference travel was charged here, but the budget has no travel line. Moving it to the department index.']],
    staff: [['Laura Fischer', 'T00433019', 'Assistant Professor', 'Salaries', 2541.67, 6110, 0.2],
      ['Jamal Wright', 'T00664402', 'Outreach Assistant', 'Wages', 1105.00, 6210, 1]],
    expenses: [[12, 7520, 'Airfare - national CS education conference', 2318.64, 'I0091744'],
      [22, 7240, 'Raspberry Pi classroom kits (25)', 1874.75, 'P0026120']]
  },

  // Foundation that paid half the award up front, so there's nothing to invoice
  {
    code: 'F25150728', title: 'First-Generation Student Mentoring Initiative',
    pi: 'Ramirez, Javier', tNumber: 'T00415528', department: 'Psychology', sponsor: 'private',
    fund: '250728', org: '38110', index: 'GR0728', start: -150, end: 580,
    budget: { salaries: 52000, fringe: 11440, expense: 16500, travel: 3200, other: 12000 },
    accounts: { other: [7710] },
    spent: 0.19, encumbered: { salaries: 0.3, fringe: 0.3, rest: 0 }, drawn: 0.5,
    risk: 'Low', manager: 'lee', cc: 'psychology@example.edu',
    review: [52, 'jordanlee'],
    notes: [[52, 'Foundation paid 50% of the award up front. Next payment after the year-one report.']],
    staff: [['Javier Ramirez', 'T00415528', 'Professor', 'Salaries', 1916.67, 6110, 0.1],
      ['Kayla Benson', 'T00701356', 'Peer Mentor', 'Wages', 640.00, 6210, 1],
      ['Diego Alvarado', 'T00709921', 'Peer Mentor', 'Wages', 590.00, 6210, 1]],
    expenses: [[9, 7710, 'Mentee book scholarships', 1500.00, 'J0048276'],
      [20, 7420, 'Mentor training workbooks', 248.90, 'I0091626']]
  }
];

// ----------------------------------------------------------------------------
// Turn the grant list above into the rows the real app reads from its sheets
// ----------------------------------------------------------------------------
const DEMO_CATEGORY_ORDER = ['salaries', 'fringe', 'expense', 'travel', 'other', 'indirect'];
// Small differences per category and per account, so amounts don't come out as round numbers
const DEMO_CATEGORY_WOBBLE = [0.013, -0.009, 0.007, -0.016, 0.011, -0.004];
const DEMO_ACCOUNT_WOBBLE = [1.08, 0.9, 1.03, 0.95];

function demoShare_(value, category) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return value[category] ?? value.rest ?? 0;
}

// Split an amount by weights, rounded to `step` (1 = whole dollars, 0.01 = cents), keeping the exact total
function demoSplit_(total, weights, step) {
  const units = Math.round(total / step);
  const sum = weights.reduce((a, b) => a + b, 0);
  let used = 0;
  return weights.map((w, i) => {
    const u = i === weights.length - 1 ? units - used : Math.round(units * w / sum);
    used += u;
    return Math.round(u * step * 100) / 100;
  });
}

function demoAccountTitle_(code) {
  for (const cat of Object.keys(DEMO_ACCOUNTS)) {
    const account = DEMO_ACCOUNTS[cat].find(a => a[0] === code);
    if (account) return { title: account[1], category: cat };
  }
  return { title: 'Account ' + code, category: 'other' };
}

function demoBuildGrant_(spec, today) {
  const startDay = today + spec.start;
  const endDay = today + spec.end;
  const rows = [];
  const addRow = (code, title, group, budget, activity, encumbrance) => {
    const r = new Array(24).fill('');
    r[DASH_BAR.CODE] = spec.code;
    r[DASH_BAR.TITLE] = spec.title;
    r[DASH_BAR.START] = startDay;
    r[DASH_BAR.END] = endDay;
    r[DASH_BAR.PI_NAME] = spec.pi;
    r[DASH_BAR.PI_TNUMBER] = spec.tNumber;
    r[DASH_BAR.ACCT_TITLE] = title;
    r[DASH_BAR.INDEX] = spec.index;
    r[DASH_BAR.INDEX_FUND] = spec.fund;
    r[DASH_BAR.INDEX_ORG] = spec.org;
    r[DASH_BAR.ACCT_CODE] = code;
    r[DASH_BAR.BUDGET] = budget;
    r[DASH_BAR.ACTIVITY] = activity;
    r[DASH_BAR.ENCUMBRANCE] = encumbrance;
    r[DASH_BAR.ORG] = spec.org;
    r[DASH_BAR.DEPARTMENT] = spec.department;
    r[DASH_BAR.FUND] = spec.fund;
    r[DASH_BAR.SUMMARY_GROUP] = group;
    rows.push(r);
  };

  let totalBudget = 0;
  let totalActivity = 0;
  const expenseRows = [];
  DEMO_CATEGORY_ORDER.forEach((cat, ci) => {
    const budget = (spec.budget && spec.budget[cat]) || 0;
    if (!budget) return;
    const only = spec.accounts && spec.accounts[cat];
    const accounts = DEMO_ACCOUNTS[cat].filter(a => !only || only.includes(a[0]));
    const spent = demoShare_(spec.spent, cat) * (1 + DEMO_CATEGORY_WOBBLE[ci]);
    const activity = budget * spent;
    const encumbrance = budget * demoShare_(spec.encumbered, cat);
    const budgets = demoSplit_(budget, accounts.map(a => a[2]), 1);
    const activityWeights = budgets.map((b, i) => b * DEMO_ACCOUNT_WOBBLE[i % DEMO_ACCOUNT_WOBBLE.length]);
    const activities = demoSplit_(activity, activityWeights, 0.01);
    const encumbrances = demoSplit_(encumbrance, budgets, 0.01);
    accounts.forEach((a, i) => addRow(a[0], a[1], DEMO_SUMMARY_GROUPS[cat], budgets[i], activities[i], encumbrances[i]));
    totalBudget += budget;
    totalActivity += activities.reduce((s, v) => s + v, 0);
  });
  (spec.unbudgeted || []).forEach(([code, amount]) => {
    const acct = demoAccountTitle_(code);
    addRow(code, acct.title, DEMO_SUMMARY_GROUPS[acct.category], 0, amount, 0);
    totalActivity += amount;
  });

  // Revenue: the award, and what's been billed (or paid up front) so far
  const drawn = spec.drawn !== undefined
    ? totalBudget * spec.drawn
    : Math.min(totalActivity * (spec.billed || 0), totalBudget);
  const revenue = DEMO_REVENUE_ACCOUNTS[spec.sponsor];
  addRow(revenue[0], revenue[1], DEMO_SUMMARY_GROUPS.revenue, totalBudget, Math.round(drawn * 100) / 100, 0);
  rows.unshift(rows.pop()); // revenue first, like the BAR import

  const ago = days => dashFormatShortDate_(today - days);
  const fullDate = day => {
    const p = dashYMD_(day);
    return String(p.m).padStart(2, '0') + '/' + String(p.d).padStart(2, '0') + '/' + p.y;
  };
  (spec.expenses || []).forEach(([days, code, description, amount, reference]) => {
    expenseRows.push({ date: fullDate(today - days), accountCode: code, accountName: demoAccountTitle_(code).title,
      description: description, amount: amount, reference: reference });
  });

  const salaryRows = [];
  const laborRows = [];
  (spec.staff || []).forEach(([name, tNumber, jobTitle, type, paid, account, percent]) => {
    if (paid !== null && spec.end > 0) {
      salaryRows.push({ tNumber: tNumber, type: type, name: name, title: jobTitle, amount: paid });
      if (type === 'Salaries') {
        salaryRows.push({ tNumber: tNumber, type: 'Benefits', name: name, title: jobTitle, amount: Math.round(paid * 33) / 100 });
      }
    }
    laborRows.push({ name: name, jobTitle: jobTitle, account: account, accountTitle: demoAccountTitle_(account).title,
      percent: percent, details: 'Effective ' + ago(-spec.start) + ' to ' + dashFormatShortDate_(endDay) });
  });

  const piFirstLast = spec.pi.split(', ').reverse().join(' ');
  return {
    code: spec.code,
    rows: rows,
    data: {
      grantName: spec.title,
      piName: spec.pi,
      department: spec.department,
      risk: spec.risk,
      notes: (spec.notes || []).map(([days, text]) => ago(days) + ' - ' + text).join('\n'),
      reviews: { assistantDirector: '', accountant: '', ...(spec.reviews || {}) },
      reviewDay: spec.review ? today - spec.review[0] : null,
      reviewer: spec.review ? spec.review[1] : '',
      assignments: {
        ...DEMO_MANAGERS[spec.manager || 'none'],
        recipient: piFirstLast,
        recipientEmail: piFirstLast.toLowerCase().replace(/[^a-z ]/g, '').replace(' ', '.') + '@example.edu',
        ccEmails: spec.cc || ''
      }
    },
    fund: spec.fund,
    org: spec.org,
    salaryRows: salaryRows,
    expenseRows: expenseRows,
    laborRows: laborRows
  };
}

/** Every demo grant, with dates counted from `today` (a day number). */
function demoBuildGrants(today) {
  return DEMO_GRANTS.map(spec => demoBuildGrant_(spec, today));
}
