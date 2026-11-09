# Grant Budget Availability Report: Demo

A working demo of the Grant Budget Availability Report dashboard that Southern Utah
University's SPARC office uses to monitor sponsored-project budgets. The production
version is a Google Apps Script web app backed by a Google Sheet. This copy runs entirely
in the browser on **made-up sample data**: every grant, person, account number and dollar
amount is fictional.

**Live demo:** https://nathanwiggins.github.io/bar-demo/

## Things to try

- **BAR Tools → Load Grant Project** opens the project picker. Filter by risk level,
  department, manager or reviews waiting, and sort by clicking a column header.
- Each sample grant shows a different situation: on track, underspending, a category
  overspent, overspent overall, ending soon, ended with money left, nothing spent yet,
  spending not yet invoiced, spending in an unbudgeted category.
- **BAR Reports** opens the last 30 days of salaries and expenses, and current labor
  distributions, for the loaded grant.
- Add a comment under **Project Notes**, then use **BAR Tools → Save Changes** or
  **Mark Project as Reviewed**.
- Switch **Signed in as** in the banner to the Assistant Director or SPARC Accountant.
  Marking a grant reviewed as one of them completes their requested review.
- **Reset demo** clears everything you've saved. Saves live only in your browser's
  local storage; there is no server.

## How it works

The page is the production `Dashboard.html`, unchanged except for a demo banner and three
script tags. The real app talks to its server only through `google.script.run`, so the demo
supplies its own:

| File | What it is |
| --- | --- |
| `index.html` | The production dashboard page, plus the demo banner and script tags (marked `Demo only`) |
| `js/dash-compute.js` | The production budget math (`dashComputeGrant_` and helpers), copied unchanged |
| `js/demo-data.js` | The sample grants. Dates are relative to today, so each grant shows the same situation whenever it's viewed |
| `js/demo-server.js` | A stand-in for `google.script.run` that answers the dashboard's server calls from the sample data |
| `demo.css` | Banner styles |

Because the figures and status indicators come from the production calculation code, the
demo computes them exactly as the real dashboard does.

## Not in the demo

The production project also imports CSV reports emailed to it into the sheet, generates
PDF budget reports and emails them to PIs, and sends weekly high-risk and closeout
reminders. Those run in Apps Script against the sheet and aren't part of this demo.

## Updating from the production project

1. Copy the production `Dashboard.html` over `index.html`, then re-add the three blocks
   marked `Demo only` (the stylesheet link, the banner, and the script tags).
2. Re-copy the pure calculation section of `DashScripts.js` into `js/dash-compute.js`
   (the `DASH_BAR` constants and everything from `DASH_DEFAULT_LABELS` through
   `dashMergeNotes_`).
3. If a server function the page calls changed, update `js/demo-server.js` to match.

## Running locally

Any static file server works, for example:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000/.
