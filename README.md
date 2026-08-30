# BottleResult — Explainable & Verifiable School Result Intelligence Platform

> **Problem P08** — School Result Processing and GPA Engine  
> **Core Positioning:** *“Every Result Has a Reason.”*  
> **Team ID:** `LSH26-T010`

---

## 🌟 Live Demonstration

🔗 **Live Application:** [https://bottleresult.vercel.app](https://bottleresult.vercel.app)  
✨ **Interactive Judge Tour:** [https://bottleresult.vercel.app/demo](https://bottleresult.vercel.app/demo)

---

## 📖 Project Overview

**BottleResult** transforms structured school marks into accurate, explainable, verifiable, auditable, and publishable academic transcripts. Rather than treating GPA calculation as a black box, BottleResult provides a transparent **mathematical calculation trace** for every subject, surfaces discrepancies in an automated **Checking Center**, enforces strict **Row Level Security (RLS)**, and issues cryptographic **QR verification tokens** for public result lookup.

### 🛡️ Non-Negotiable Product Principles
1. **Zero Hardcoding**: All visible metrics, student counts, pass/fail ratios, and grade points are derived dynamically from the official P08 dataset and the deterministic result engine.
2. **Pure Deterministic Calculation**: The engine is the sole authority on grade points, GPA, letter grades, practical failures, absences, and 4th subject contributions. **AI is never used to determine official grades or marks.**
3. **Data-Driven Rules**: Official Bangladesh SSC rules and component pass thresholds are stored in the database and configured via the administrative interface — never hardcoded or invented.
4. **Resilient Architecture**: Full graceful degradation if WebGL, 3D, or external networks are unavailable.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Deterministic Result Engine** | Pure, isolated, unit-tested engine computing Grade Points (0.00–5.00), Letter Grades (A+ to F), and composite GPA. |
| **“Why This Result?” Trace** | Step-by-step mathematical trace explaining compulsory sums, optional subject excess formulas, and failure causes. |
| **Checking Center & Scrutiny** | Automated detection and categorization of compulsory failures, practical component issues, absences, and low GP. |
| **Marks Management & Recalc** | Inline editor for theory, practical, and absent marks with instant recalculation and old-vs-new comparison. |
| **Immutable Audit Trail** | Captures every state mutation, mark correction, rule change, and issue resolution with full user/timestamp diffs. |
| **Public Result Portal** | Clean, mobile-responsive portal for students to search by Roll/ID and inspect their certified transcripts. |
| **QR Code Verification** | Generates secure digital verification tokens and instant mobile scan verification pages (`/verify/[token]`). |
| **Official PDF & Print** | Clean printable styling and instant vector PDF transcript generation with signatures and QR code. |
| **Live Analytics Dashboard** | Real-time charts powered by Recharts (Pass/Fail ratio, GPA distribution, grade bands, practical vs theory gap). |
| **Judge Demo Mode** | Curated 6-step guided walkthrough featuring strong students (S001), failures (S002), absences (S032), and audit trails. |
| **Command Palette** | Global `Cmd/Ctrl + K` palette for rapid navigation, candidate search, and action execution. |
| **Lightweight 3D Visuals** | React Three Fiber wireframe geometric hero scene with smooth WebGL fallback. |

---

## 📐 Official Grading & GPA Formula Specification

### 1. Marks-to-Grade-Point Mapping (Bangladesh SSC Standard)

| Marks Range | Letter Grade | Grade Point (GP) | Remarks |
| :---: | :---: | :---: | :--- |
| **80 – 100** | **A+** | **5.00** | Outstanding / Distinction |
| **70 – 79** | **A** | **4.00** | Excellent |
| **60 – 69** | **A-** | **3.50** | Very Good |
| **50 – 59** | **B** | **3.00** | Good |
| **40 – 49** | **C** | **2.00** | Satisfactory |
| **33 – 39** | **D** | **1.00** | Pass |
| **0 – 32** | **F** | **0.00** | Fail |

### 2. Composite GPA Calculation Formula

$$\text{Compulsory GP Sum} = \sum_{i=1}^{6} \text{GP}(\text{Compulsory Subject}_i)$$

$$\text{Optional 4th Subject Contribution} = \max\left(0, \text{GP}(\text{Optional Subject}) - 2.00\right)$$

$$\text{Composite GPA} = \min\left(5.00, \frac{\text{Compulsory GP Sum} + \text{Optional Contribution}}{6}\right)$$

* **Compulsory Failure Consequence**: If any of the 6 compulsory subjects receives Grade F (marks < 33 or Absent), the overall result fails with $\text{GPA} = 0.00$ ($\text{Grade F}$).
* **Absence Handling**: Absence is stored as a normalized `"AB"` state flag rather than a numeric zero.

---

## 🏗️ System Architecture

```
                       ┌───────────────────────────────────┐
                       │          Client Browser           │
                       └─────────────────┬─────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       ┌────────────────────────┐                 ┌────────────────────────┐
       │  Public Result Portal  │                 │    Admin Dashboard     │
       │  (/, /results, /verify)│                 │   (/admin/*, /demo)    │
       └───────────┬────────────┘                 └────────────┬───────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │        Next.js 15 App Router Backend       │
                   │    (Route Handlers, Server Actions, Auth) │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │    Deterministic Result Engine (v1.0.0)   │
                   │ (calculateGPA, validateMarks, detectFail) │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │       Supabase PostgreSQL Database        │
                   │ (RLS, Constraints, Cases, Students, Marks)│
                   └───────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Constraints

The PostgreSQL schema is defined in `database/migrations/001_initial_schema.sql` and includes:

* `profiles`: User roles (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `VIEWER`) and authentication mapping.
* `cases`: Examination cohorts (`PUB-01` to `PUB-25`).
* `classes`: Class partitions (`Class 9`, `Class 10`).
* `subjects`: Subject definitions with `theory_max`, `practical_max`, and compulsory flags.
* `students`: Unique candidate codes within cohorts (`UNIQUE(case_id, student_code)`).
* `marks`: Theory, practical, and absent state flags (`UNIQUE(student_id, subject_id)`).
* `results`: Final calculated GPAs, letter grades, and unique verification tokens.
* `subject_results`: Traceable per-subject intermediate values and decision outcomes in `calculation_details` JSONB.
* `checking_items`: Auto-generated scrutiny flags (`OPTIONAL_LOW`, `PRACTICAL_FAILURE`, `ABSENT`, `COMPULSORY_FAILURE`).
* `audit_logs`: Immutable ledger of every mark correction, recalculation diff, and rule change.
* `grading_rules`: Active policy configuration driving the deterministic engine.

---

## 🛠️ Local Development & Setup

### Prerequisites
* Node.js v18+ (tested on Node v24)
* npm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/tasnimul1331/LSH26-T010-P08.git
cd LSH26-T010-P08

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local mock / full dataset store)
cp .env.example .env.local

# 4. Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The repository contains 56 automated unit and integration tests verifying:
* Grade point boundaries (0, 32, 33, 39, 40, 79, 80, 100)
* Practical and theory separate component evaluations
* Absence `"AB"` state normalization
* Optional 4th subject formula contributions
* Compulsory failure overrides
* Real candidate dataset validation (Kamal Begum S001, S002, S032)
* Live mark editing, recalculation, and audit logging

```bash
# Run all tests
npx vitest run
```

---

## 🚀 Deployment (Vercel + Supabase)

1. **Deploy to Vercel**:
   * Connect your GitHub repository to Vercel.
   * Add environment variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```
2. **Execute Database Migrations**:
   * Run `database/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. **Seed Database (Optional)**:
   ```bash
   npx tsx database/seed/import.ts
   ```

---

## 📄 License & Attribution

Licensed under the **MIT License**. See [LICENSES.md](file:///c:/Users/Hp/OneDrive/Desktop/Hackathon/LSH26-T010-P08/LICENSES.md) for full third-party dependency licenses and typography notices.
