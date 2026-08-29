# Fraud Triage Copilot

A rule-based fraud operations dashboard for prioritizing, explaining, and acting on flagged cases — built as a product management portfolio project.

🔗 **Live demo:** https://fraud-copilot-workbench.lovable.app

## What it does

Fraud analysts triage a high volume of flagged cases daily across debit card fraud, wire transfers, and identity theft — often without a consistent way to prioritize, explain, or act on them. This tool:

- Scores every case for risk (0–100) using transparent, explainable rules — not a black-box model
- Generates a plain-language AI summary of each case from its own data
- Recommends a specific next action per risk level, with a sub-task checklist
- Tracks case status through resolution (New → In Review → Escalated → Resolved)
- Models the dollar value of catching high-risk fraud before funds are released, via an adjustable "Fraud Loss Prevented Simulator"

## Why I built it

As a fraud specialist handling debit card fraud, wire transfers, and identity theft cases, I wanted to build the triage tool I'd actually want to use — one that prioritizes, explains itself, and tells an analyst what to do next.

## Scope

This is a frontend-only demo running entirely on simulated mock data. Deliberately **not** included: user authentication, a real backend/database, live ML model training, or integration with actual bank systems. Full reasoning for these scope decisions is documented in the project's PRD.

## Tech

Built with [Lovable](https://lovable.dev) — AI-assisted, full-stack code generation.

---

*This project was built for product management portfolio purposes. All customer and case data is simulated.*
