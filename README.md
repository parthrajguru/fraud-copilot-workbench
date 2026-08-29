# Fraud Guardian

Build a "Fraud Triage Copilot" web app for a bank's fraud operations team. This is a product management portfolio project, so it should look clean, professional, and operationally credible — like a real analyst tool, not a toy.

=== CORE DASHBOARD ===

1. Summary cards at the top:

   - Open cases

   - % high-risk cases

   - Total dollar exposure (sum of amounts on open high-risk cases)

   - Avg. time to resolution (in hours)

   - Cases currently in review

2. A case table below the cards with these columns:

   - Case ID (format: CASE-1001, CASE-1002, etc.)

   - Case type — badge: Card Fraud / Wire Fraud / Identity Theft

   - Customer name (generate realistic mock names)

   - Amount ($)

   - Risk Score (0-100)

   - Risk Segment — color-coded badges: green (Low) / yellow (Medium) / red (High)

   - Status — badges: New (gray) / In Review (blue) / Escalated (orange) / Resolved (green)

3. Risk Score calculation (rule-based, not ML — show your work), with signals tailored per case type:

   - Transaction velocity (30% weight): number of transactions/attempts in a short window, normalized 0-100

   - Anomaly vs. customer baseline (30% weight): how much this transaction deviates from the customer's typical amount/behavior, normalized 0-100

   - Device/location mismatch (25% weight): whether the transaction came from a new device, IP, or geographic location inconsistent with the customer's history, normalized 0-100

   - New payee/recipient flag (15% weight): for wire transfers specifically, whether this is a first-time recipient (0 or 100 — binary signal); for card/identity cases, treat this weight as folded into anomaly score

   - Score bands: 0-33 = Low risk, 34-66 = Medium risk, 67-100 = High risk

4. Generate 50 mock cases with realistic, varied data across all three case types and a mix of risk levels (not clustered in one segment)

5. Click on any case to open a detail panel showing:

   - Full case details (customer, amount, case type, all signal values)

   - "Why this score" breakdown: each weighted factor shown individually with sub-scores and a plain-language explanation

   - An "AI Case Summary" section: a 3-4 sentence auto-generated narrative summarizing the case in plain analyst-readable language, e.g. "This customer's debit card was used for 4 transactions totaling $1,240 within a 35-minute window across two different states, a pattern inconsistent with 6 months of prior activity showing single, local transactions under $150. Device fingerprint does not match any previously seen device on this account." (Generate a distinct, plausible narrative per case based on its actual mock data values — don't reuse the same template text.)

   - A "Recommended Action" card based on risk segment:

     - High risk: "Escalate to SIU (Special Investigations Unit) + place temporary hold on account" — with a small checklist: Freeze affected account, Escalate to SIU queue, Notify customer via verified contact method

     - Medium risk: "Hold transaction pending manual verification call to customer"

     - Low risk: "Clear — no action needed, log for pattern monitoring"

   - A Case Status control: four-state selector (New / In Review / Escalated / Resolved), with a timestamp showing when it was last updated. Status must persist in app state when navigating between cases.

6. A filter/sort bar above the table: filter by case type, filter by risk segment, filter by status, sort by risk score or amount

=== FRAUD LOSS PREVENTED SIMULATOR ===

Add a card titled "Fraud Loss Prevented Simulator", placed between the summary cards and the case table.

- A slider labeled "Assumed catch rate on high-risk cases" ranging from 0% to 100%, default at 70%

- As the slider moves, dynamically calculate and display:

  - "Cases caught" = (number of High risk cases) × (catch rate %)

  - "Loss prevented" = sum of amounts for that number of highest-dollar high-risk cases × catch rate %

- Below the stats, a short caption: "Based on X high-risk cases worth $Y in total exposure, assuming this team catches fraud at the selected rate before funds are released."

- Derive all numbers from the existing mock case data — no new data needed.

=== CASE TYPE BREAKDOWN CHART ===

Add a simple bar or donut chart showing risk distribution broken down by case type (Card Fraud / Wire Fraud / Identity Theft) — how many High/Medium/Low risk cases exist within each type. Place this near the top of the page, next to or below the summary cards. Use the same red/yellow/green convention as the risk badges elsewhere.

=== METHODOLOGY EXPLAINER ===

Add a "How the risk score works" section near the bottom of the page, showing the four weighted factors (Transaction velocity 30%, Anomaly vs. baseline 30%, Device/location mismatch 25%, New payee flag 15%) with plain-language descriptions, plus the score bands and their associated actions.

=== DATA FRESHNESS + CSV EXPORT ===

- Add a small "Last updated" timestamp near the top reflecting the most recent status change made anywhere in the app. Show "No updates yet" if none have been made.

- Add an "Export to CSV" button above the case table that downloads the currently filtered/sorted case list with all visible columns.

=== DESIGN ===

Clean, modern operational dashboard aesthetic — think a bank's internal fraud ops tool, not a consumer app. Neutral background (white/light gray), one accent color for primary actions, red/yellow/green reserved for risk badges only. Consistent spacing, border radius, and font weights across all cards. Data-dense but not cluttered — this will be screenshotted for a case study, so it needs to look credible and interview-ready.

Do NOT add: user authentication, a real backend/database, real ML model training, or integration with actual bank systems. This runs entirely on mock/simulated data in the frontend. The "AI Case Summary" narratives should be pre-written/templated per case based on its mock data values, not calling a real LLM API.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fraud-copilot-workbench.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dc9d1ca4-f4e8-48d2-b1ad-b6e19586306e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
