# Geopolitical Risk Dashboard — Overhaul Proposal

**Status:** Draft for review
**Date:** June 2026
**Scope:** Replace the periodic PDF-based Geopolitical Risk Dashboard with a continuously updated, interactive web product, while preserving the PDF as an automated export.

---

## 1. What we have today

The dashboard is published as a static PDF whitepaper on a periodic (roughly monthly) cycle. Each issue contains:

- A **global risk indicator** chart: a sentiment-adjusted measure of market attention to geopolitical risk, derived from text mining of brokerage reports and financial news, scored against a 5-year rolling history.
- A **top-10 risks table** (e.g., global trade protectionism, Middle East regional war, U.S.–China strategic competition, technology decoupling, major cyber attacks, Russia–NATO conflict, etc.), sorted by **likelihood** — a low/medium/high judgment from subject-matter experts.
- A per-risk **attention score** reflecting how much market attention each risk is receiving relative to its own history.
- Narrative sections per risk: description, recent developments, and market/portfolio implications.

### Why it's legacy

| Pain point | Consequence |
| --- | --- |
| **Stale between issues** | The attention indicator is computable daily, but readers see a snapshot that is up to a month old. During fast-moving events (the exact moments this product exists for), the PDF is least useful. |
| **No interactivity** | Readers can't drill into a risk's attention history, compare risks, change time windows, or see what drove a score move. |
| **Manual production pipeline** | Each issue requires analysts and designers to regenerate charts, tables, and layout by hand — slow, error-prone, and expensive. |
| **No programmatic access** | Internal teams and clients who want the indicator in their own models scrape PDFs or re-key numbers. No API, no embeds. |
| **No change tracking** | A reader can't see how a risk's likelihood rating or attention score evolved across issues without opening every past PDF side by side. |
| **No alerting** | Nothing notifies stakeholders when an attention score spikes or a likelihood rating changes — the channel is "wait for the next PDF." |
| **Accessibility & mobile** | Fixed-layout PDF charts are poor for screen readers and phones, where a large share of readership now lives. |

---

## 2. Proposed product

A **live, interactive web dashboard** with an automated data pipeline behind it. The PDF doesn't go away — it becomes a one-click, auto-generated export of the live state, preserving the existing distribution channel and compliance artifact.

### 2.1 Core views

1. **Overview** — the global risk indicator as an interactive time-series (zoom, hover, selectable windows: 1M / 6M / 1Y / 5Y / max), with annotated event markers ("what moved the line"), plus headline KPI cards: current global score, 30-day delta, biggest mover, count of high-likelihood risks.
2. **Top risks table** — the familiar top-10, now sortable by likelihood, attention score, or recent change. Each row shows likelihood (low/medium/high badge), current attention score, a sparkline of the last 90 days, and a delta arrow vs. the prior issue. Rating changes since the last issue are visually flagged.
3. **Risk detail pages** — one per tracked risk: full attention-score history charted against the 5-year baseline; the expert likelihood rating with its change log; the narrative sections (description, recent developments, market implications) rendered as versioned content, not baked pixels; and a feed of the highest-signal source documents driving the current score.
4. **Compare mode** — overlay 2–4 risks' attention histories on one chart; useful for correlated risks (e.g., U.S.–China competition vs. technology decoupling).
5. **Movers & alerts** — a change-log view of every score spike, rating change, and narrative update, with email/webhook subscriptions per risk.
6. **Archive** — every historical "issue" remains addressable: any past date renders the dashboard as it stood then (point-in-time view), replacing the PDF back-catalogue.

### 2.2 Distribution

- **Auto-generated PDF**: a scheduled job renders the dashboard's current state to the existing PDF layout (headless Chromium print pipeline). The monthly publication continues with zero manual chart production.
- **Read API + embeds**: a versioned JSON API for scores and ratings, plus embeddable chart widgets for internal portals and client sites.
- **Email digest**: an automated monthly (and on-spike) summary linking into the live views.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ INGESTION (scheduled)                                       │
│  brokerage-report feed · financial news feed                │
│  → entity/risk tagging → sentiment scoring                  │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SCORING SERVICE (daily batch)                               │
│  attention frequency, sentiment-adjusted, normalized        │
│  against 5-year rolling history → per-risk + global score   │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (Postgres / Supabase)                              │
│  risks · daily_scores · likelihood_ratings (versioned)      │
│  narratives (versioned, with approval state) · alerts       │
└──────────┬──────────────────────────────┬───────────────────┘
           ▼                              ▼
┌─────────────────────┐        ┌─────────────────────────────┐
│ ANALYST CMS         │        │ PUBLIC READ API             │
│  edit narratives,   │        │  → React SPA (dashboard)    │
│  set likelihoods,   │        │  → PDF render job           │
│  approve & publish  │        │  → embeds / email digest    │
└─────────────────────┘        └─────────────────────────────┘
```

Key decisions:

- **Quantitative and editorial content are decoupled.** Attention scores flow through automatically every day; likelihood ratings and narratives change only through an analyst workflow with draft → review → approve states and a full audit trail. Nothing editorial ships without sign-off — this preserves the compliance posture of the current publication process.
- **Point-in-time correctness.** Ratings and narratives are stored as versioned rows (valid-from / valid-to), so the archive view and the auto-generated PDFs are exact reconstructions, which matters for a document that clients cite.
- **The PDF is a render target, not a source of truth.** This single inversion removes most of the manual production pipeline.

### 3.1 Recommended stack (grounded in this repo)

This repository already proves out most of the frontend architecture:

| Layer | Recommendation | Rationale |
| --- | --- | --- |
| Frontend | **React 19 + Vite 7 + Tailwind 4** (current stack) | Already in place; dark navy/cyan theme suits a risk product; `src/components/ui/` primitives (`StatCard`, `RiskBadge`, `SignificanceBar`) map directly onto the new KPI cards, likelihood badges, and score bars. |
| Charts | **Recharts** (add) | The only missing frontend capability is time-series charting; Recharts covers line/area/sparkline with good a11y. |
| Data layer | **Supabase (Postgres + Auth + Row-Level Security)** | The repo's `supabase/schema.sql` and the mock client in `src/lib/supabase.js` were built as a swappable abstraction — hooks (`useEntities`-style) stay unchanged when the real client is restored. RLS separates analyst CMS access from public read. |
| Scoring jobs | Scheduled edge functions or a small Python batch service | Daily cadence; nothing latency-sensitive. |
| PDF export | Headless Chromium (Playwright) print route | Renders the live dashboard with a print stylesheet matching the current PDF layout. |
| Hosting | Static SPA (GitHub Pages flow already exists in `.github/workflows/deploy.yml`) + Supabase backend | Keeps the deployment story we already have. |

Data licensing note: the brokerage-report and news feeds powering the attention score are licensed sources. Redistribution terms must be reviewed before the public API exposes anything beyond the derived scores; raw source documents likely stay behind the analyst CMS.

### 3.2 Data model (core tables)

```sql
risks               (id, slug, name, description, category, active)
daily_scores        (risk_id, date, attention_score, raw_frequency,
                     sentiment_adj, baseline_5y)        -- append-only
likelihood_ratings  (risk_id, rating, rationale, set_by,
                     valid_from, valid_to)              -- versioned
narratives          (risk_id, section, body_md, version,
                     state[draft|review|published],
                     author, approver, published_at)    -- versioned
issues              (id, publication_date, pdf_url)     -- archive index
alert_rules         (user_id, risk_id, trigger_type, threshold, channel)
```

---

## 4. Phased delivery

**Phase 1 — Read-only live dashboard (4–6 weeks)**
Overview chart, top-risks table, risk detail pages, backfilled with the historical score series and current published content. Static deploy on the existing Pages pipeline. *Exit criterion: the live site can fully reproduce the current PDF issue.*

**Phase 2 — Automated pipeline + PDF export (4 weeks)**
Daily scoring job in production; headless-Chromium PDF export replicating the current layout; archive/point-in-time views. *Exit criterion: one monthly issue published end-to-end with no manual chart work.*

**Phase 3 — Analyst CMS + alerts (4–6 weeks)**
Editorial workflow with approvals and audit trail; rating change-log; email/webhook alerts; compare mode.

**Phase 4 — API & embeds (3–4 weeks)**
Versioned read API, embeddable widgets, email digest. Pending data-licensing review.

Each phase ships independently; Phase 1 alone already retires the biggest pain points (staleness and no interactivity) for internal users.

---

## 5. Risks & open questions

1. **Compliance/review workflow** — the current PDF passes through editorial and legal review per issue. The proposal moves that gate into the CMS (per-change approval) for editorial content, while quantitative scores publish automatically. Needs sign-off from the publication owners.
2. **Data licensing** — confirm redistribution rights for derived scores via API/embeds (Phase 4 dependency).
3. **Score methodology stability** — the dashboard's credibility rests on a consistent methodology; any pipeline reimplementation must be validated against the historical published series before cut-over (acceptance test: reproduce the last 12 issues' scores within tolerance).
4. **Audience access tiers** — decide whether the live dashboard is public (like the current PDF), client-gated, or tiered. The auth scaffolding in this repo (`AuthContext` + protected routes) supports any of the three.
