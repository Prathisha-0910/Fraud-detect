# 🛡️ SENTRA — Amount-Agnostic Fraud Intelligence Platform

> **"Every Rupee Protected, Not Just the Big Ones."**

SENTRA is a real-time, amount-agnostic fraud intelligence platform designed to protect vulnerable digital banking users — including senior citizens, first-time UPI users, and rural banking customers — from sophisticated micro-fraud, salami slicing, social engineering scams, and phishing attacks.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [The Problem Statement](#-the-problem-statement)
- [How SENTRA Works](#-how-sentra-works)
  - [1. Multi-Engine Fraud Intelligence Architecture](#1-multi-engine-fraud-intelligence-architecture)
  - [2. Cumulative Risk Momentum & Pattern Recognition](#2-cumulative-risk-momentum--pattern-recognition)
  - [3. Risk Matrix & Actionable Interventions](#3-risk-matrix--actionable-interventions)
- [Key Features & Modules](#-key-features--modules)
- [Who Benefits & Societal Impact](#-who-benefits--societal-impact)
- [Technology Stack](#-technology-stack)
- [Database & Data Models](#-database--data-models)
- [Installation & Getting Started](#-installation--getting-started)
- [Hackathon Demo Guide](#-hackathon-demo-guide)
- [Future Roadmap](#-future-roadmap)

---

## 🛡️ Overview

Digital payment adoption (UPI, NetBanking, Cards) has skyrocketed. However, existing fraud detection systems in traditional banks heavily prioritize **transaction amount**. Scammers exploit this blind spot by tricking victims into making multiple **small-value payments** (e.g., ₹500, ₹1,000, ₹2,000) under high psychological pressure (coercion, fake tech support, digital arrest, QR scams).

**SENTRA** shifts the paradigm from *Value-Based Detection* to *Pattern-Based Contextual Detection*. By evaluating risk based on transaction velocity, call context, message urgency, domain reputation, document NLP, and QR direction, SENTRA identifies financial scams **before** the victim loses substantial funds.

---

## 🚨 The Problem Statement

### Why Traditional Fraud Detection Fails

1. **Amount Bias**: Traditional bank rule engines trigger alerts primarily on large transactions (e.g., > ₹50,000). A series of 4 small ₹2,000 transfers passes unnoticed under standard thresholds.
2. **Social Engineering Vulnerability**: Scammers use fake urgency ("Your electricity will be cut", "Customs parcel block", "Refund processing") to manipulate victims into self-authorizing payments.
3. **QR Direction Confusion**: Fraudsters trick users into scanning a QR code with the promise of *receiving* money, when in reality scanning a QR code always *deducts* money.
4. **Lack of Guardian Safeguards**: Senior citizens often operate smartphones in isolation without real-time oversight from family members or trusted guardians.

---

## ⚙️ How SENTRA Works

### 1. Multi-Engine Fraud Intelligence Architecture

SENTRA runs payments and activities through **5 specialized detection engines** running in real-time:

```
                        ┌──────────────────────────────┐
                        │   Incoming UPI / Transaction │
                        └──────────────┬───────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ Risk Score      │           │ Velocity        │           │ Reputation      │
│ Core Engine     │           │ Pattern Engine  │           │ Domain/Tel Engine│
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              ┌─────────────────┐           ┌─────────────────┐
              │ Document NLP    │           │ QR Code         │
              │ Fraud Engine    │           │ Direction Engine│
              └────────┬────────┘           └────────┬────────┘
                       │                             │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Cumulative Risk Score     │
                        │ & Human Intervention      │
                        └───────────────────────────┘
```

* **Risk Score Core Engine (`risk-engine.ts`)**: Aggregates signals, normalizes scores (0–100), calculates confidence ratings, and triggers intervention dialogs.
* **Velocity Pattern Engine (`velocity-engine.ts`)**: Monitors payment frequency, new payee density, and cumulative risk escalation over rolling time windows.
* **Reputation Engine (`reputation-engine.ts`)**: Evaluates domain age, typo-squatting, banking impersonation, and known fraud phone number registries.
* **Document NLP Engine (`document-engine.ts`)**: Scans uploaded PDFs, bills, or notices for fraudulent keyphrases ("Pay immediately", "Avoid police action", "Account suspension").
* **QR Direction Engine (`qr-engine.ts`)**: Detects reverse-QR scams by analyzing intent vs. transaction payload (debit vs. credit misunderstanding).

---

### 2. Cumulative Risk Momentum & Pattern Recognition

Rather than assessing transactions in isolation, SENTRA remembers recent activity. If a user makes repeated payments to unfamiliar payees while on an active phone call, SENTRA escalates the score exponentially:

```
Transaction #1 (₹2,000 to New Payee)            ➔ Risk Score: 20 (SAFE / CAUTION)
Transaction #2 (₹2,000 + Active Call Context)   ➔ Risk Score: 42 (CAUTION)
Transaction #3 (₹2,000 + High Velocity Signal)  ➔ Risk Score: 68 (SUSPICIOUS)
Transaction #4 (₹2,500 + Cumulative Escalation) ➔ Risk Score: 92 (CRITICAL 🚨)
                                                   └─► SENTRA INTERVENES & ALERTS GUARDIAN
```

---

### 3. Risk Matrix & Actionable Interventions

SENTRA categorizes risk into **5 distinct levels**, enforcing progressive safety measures:

| Risk Score | Risk Level | System Action | User Impact |
| :--- | :--- | :--- | :--- |
| **0 – 25** | `SAFE` | Allow Transaction | Smooth, seamless payment |
| **26 – 50** | `CAUTION` | Educational Prompt | Highlights new payee or unknown link |
| **51 – 70** | `SUSPICIOUS` | Mandatory Confirmation | Forces user to confirm active call status |
| **71 – 85** | `HIGH RISK` | 60-Second Cooldown | Delays transfer & presents fraud scenario warning |
| **86 – 100** | `CRITICAL` | Block & Guardian Alert | Blocks transaction & notifies registered guardian |

---

## ✨ Key Features & Modules

1. **📊 Safety Dashboard**
   - Live safety health index and active threat meter.
   - Quick stats on protected transactions, intercepted threats, and active guardians.

2. **⚡ Interactive Transaction Simulator**
   - Test custom transactions with context signals (active phone call, urgent SMS, untrusted URL, new payee).
   - Instant breakdown of multi-engine scores.

3. **🔍 Multi-Threat Scanners**
   - **URL Threat Scanner**: Detects lookalike domains (e.g., `sbi-verify-online.com` vs `sbi.co.in`).
   - **QR Code Direction Scanner**: Warns users when scanning a payment QR that will deduct money instead of receiving a refund.
   - **Document NLP Scanner**: Scans fake electricity bills, courier release forms, and law enforcement notices for extortion language.

4. **📈 Payment Pattern & Risk Timelines**
   - Visual trajectory charts mapping risk escalation over time.
   - Filterable audit logs of all past warnings, checks, and interventions.

5. **👥 Guardian Center (Family Safety Net)**
   - Add trusted family members (e.g., son, daughter, relative).
   - Automatic SMS/Email notification dispatch when a user attempts a `CRITICAL` risk transaction.

6. **🎯 Hackathon Interactive Demo Mode**
   - Includes 6 pre-configured, real-world scam walkthroughs (Digital Arrest, Repeated Small Payments, Fake Utility Bill, QR Refund Scam, Phishing SMS, Tech Support Fraud).

---

## 👥 Who Benefits & Societal Impact

### 1. 👴 Senior Citizens & Elderly Banking Users
* **Benefit**: Senior citizens are prime targets for fear-based social engineering ("Your SIM card will be deactivated"). SENTRA acts as an intelligent digital companion, intercepting coercions before money leaves the account.

### 2. 📱 First-Time Digital & Rural Payment Users
* **Benefit**: Millions of users adoption UPI daily without fully understanding payment mechanics. SENTRA prevents QR direction misunderstandings and warns against clicking phishing links in SMS messages.

### 3. 🛡️ Family Members & Guardians
* **Benefit**: Gives peace of mind to adult children caring for elderly parents. Guardians receive immediate alerts if their relative is caught in a critical fraud attempt.

### 4. 🏦 Banks & FinTech Platforms
* **Benefit**: Reduces fraud chargebacks, customer dispute handling costs, and reputational damage without adding friction to legitimate high-frequency users.

---

## 💻 Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4, Framer Motion (animations), Lucide React (icons)
* **Backend**: Next.js Server Actions & API Routes (`app/api/analyze/route.ts`)
* **Database & ORM**: PostgreSQL with Prisma ORM v5
* **Data Visualization**: Recharts
* **Validation & Schemas**: Zod

---

## 🗄️ Database & Data Models

The application utilizes 5 primary data models defined in `prisma/schema.prisma`:

* **`User`**: Core profile, safety preferences, baseline risk score, and relationships.
* **`Transaction`**: Payment payload, payee metadata, context flags (`suspiciousCall`, `urgentMessage`, `suspiciousUrl`), and assigned risk scores.
* **`RiskAssessment`**: Breakdown of component scores (`contextScore`, `velocityScore`, `reputationScore`, `documentScore`), intervention type, and confidence level.
* **`FraudEvent`**: Audit log of security triggers, alerts, and acknowledged interventions.
* **`Guardian`**: Contact details and activation status for trusted contacts.

---

## 🚀 Installation & Getting Started

### Prerequisites

* Node.js 18.x or higher
* npm or yarn

### Quick Start (Demo Mode — No Database Required)

SENTRA comes with an in-memory demo engine so you can test all features instantly without configuring a database.

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <repository-url>
   cd techno-vit/sentra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

### Full Setup (With PostgreSQL Database)

1. Create a `.env` file in the `sentra` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sentra_db"
   ```

2. Generate the Prisma Client and push database migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

---

## 🎬 Hackathon Demo Guide

To demonstrate SENTRA’s core innovation in under 2 minutes:

1. Open **[http://localhost:3000](http://localhost:3000)**.
2. Click **Demo Mode** (⚡ icon on the sidebar).
3. Select Scenario: **"Repeated Small Payment Scam"**.
4. Click **Run Simulation Step** repeatedly:
   - *Step 1*: ₹2,000 payment to unknown payee ➔ **Risk: 20 (Safe)**
   - *Step 2*: ₹2,000 payment + call detected ➔ **Risk: 42 (Caution)**
   - *Step 3*: ₹2,000 payment + high velocity ➔ **Risk: 68 (Suspicious)**
   - *Step 4*: ₹2,500 payment + pattern threshold ➔ **Risk: 92 (CRITICAL 🚨)**
5. Observe the **Intervention Modal** pop up, blocking the transaction and sending an automated alert to the Guardian!

---

## 🔮 Future Roadmap

- [ ] **On-Device Android Accessibility SDK**: Direct integration into banking app shells for live call state detection.
- [ ] **Voice Stress & Audio Scam Detection**: Real-time background audio spectrum analysis to detect coercion keywords.
- [ ] **Cross-Bank Fraud Mesh**: Distributed ledger sharing anonymized scam phone numbers and payees across financial institutions.
- [ ] **Multi-Lingual Voice Interventions**: Audio warnings in regional Indian languages (Hindi, Tamil, Telugu, Bengali, Kannada, Marathi).

---

*SENTRA — Protecting financial dignity through intelligent context awareness.*
