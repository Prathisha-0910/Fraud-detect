<div align="center">

# 🛡️ S E N T R A
### *Next-Generation Cognitive Fraud Intelligence & Guardian Circuit-Breaker*

<p align="center">
  <strong>"Every Rupee Protected, Not Just the Big Ones."</strong>
</p>

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM_5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

### 🌐 Quick Navigation
[ **[⚡ Live Overview](#-the-sentra-paradigm)** ] &nbsp;•&nbsp; 
[ **[🧠 Architecture](#-cognitive-multi-engine-architecture)** ] &nbsp;•&nbsp; 
[ **[📈 Risk Momentum](#-cumulative-risk-momentum-salami-slicing)** ] &nbsp;•&nbsp; 
[ **[🔍 Scanners](#-threat-intelligence-scanners)** ] &nbsp;•&nbsp; 
[ **[👥 Guardian System](#-guardian-family-safety-net)** ] &nbsp;•&nbsp; 
[ **[🚀 Quick Start](#-developer-quick-start)** ] &nbsp;•&nbsp; 
[ **[🏆 Demo Guide](#-2-minute-hackathon-demo-guide)** ]

---

</div>

<br/>

## 🌐 The SENTRA Paradigm

Traditional banking security systems are **amount-biased** — they wake up when a user transfers ₹50,000, but sleep when a senior citizen or first-time digital banking user is coerced into sending four consecutive ₹1,500 payments. 

Scammers exploit this blind spot through **social engineering, digital arrest threats, reverse-QR deception, and salami slicing**.

**SENTRA** shifts the paradigm from *Value-Based Rules* to **Real-Time Cognitive Context Detection**. By correlating transaction velocity, active phone call telemetry, message urgency signals, domain reputation, and reverse-QR direction, SENTRA halts fraudulent outflows **before** life savings vanish.

<br/>

<table width="100%">
<tr>
<td width="50%" valign="top">

### ❌ Traditional Banking Systems
* **Amount Threshold Bias**: Only flags large single-value transfers (> ₹25,000–₹50,000).
* **Blind to Psychology**: Unaware of active phone calls, coercion pressure, or urgency words.
* **Reverse-QR Blindspot**: Confuses scanning to receive money with unauthorized debits.
* **Isolated Operations**: Elderly victims operate with zero family safety net.
* **Post-Mortem Resolution**: Acts *after* funds have left the banking network.

</td>
<td width="50%" valign="top">

### 🛡️ The SENTRA Cognitive Engine
* **Amount-Agnostic**: Equal vigilance on a ₹500 payment as a ₹500,000 payment.
* **Context Telemetry**: Detects active phone calls, fake urgency, and coercive context.
* **Direction Awareness**: Identifies reverse-QR deception before PIN authorization.
* **Guardian Circuit-Breaker**: Automated real-time alerts to designated family members.
* **Proactive Interventions**: Progressive cooldowns and friction modals stop fraud mid-flight.

</td>
</tr>
</table>

---

## 🧠 Cognitive Multi-Engine Architecture

SENTRA processes incoming payments and digital activities through **5 synchronized real-time engines**:

```mermaid
flowchart TD
    TX["Incoming Transaction / Digital Activity"] --> DIVERGE{"Parallel Engine Dispatch"}

    DIVERGE --> E1["1. Core Risk Engine<br/>(Signal Normalization & Weights)"]
    DIVERGE --> E2["2. Velocity Pattern Engine<br/>(Rolling Window & Rapid Payees)"]
    DIVERGE --> E3["3. Reputation Engine<br/>(Domain Age, Phish & Phone Registry)"]
    DIVERGE --> E4["4. Document NLP Engine<br/>(Extortion & Fake Bill Analysis)"]
    DIVERGE --> E5["5. QR Direction Engine<br/>(Debit vs Credit Payload Intent)"]

    E1 --> AGG["Cumulative Risk Aggregator & Momentum Analyzer"]
    E2 --> AGG
    E3 --> AGG
    E4 --> AGG
    E5 --> AGG

    AGG --> SCORE{"Unified Risk Score<br/>(0 — 100)"}

    SCORE -->|0 - 25| ACT_SAFE["🟢 SAFE: Allow Seamless Transfer"]
    SCORE -->|26 - 50| ACT_CAUTION["🟡 CAUTION: Highlight Payee Context"]
    SCORE -->|51 - 70| ACT_SUSP["🟠 SUSPICIOUS: Mandatory Call Verification"]
    SCORE -->|71 - 85| ACT_HIGH["🔴 HIGH RISK: 60s Psychological Cooldown"]
    SCORE -->|86 - 100| ACT_CRIT["🚨 CRITICAL: Hard Block & Guardian Alert Dispatch"]
```

### 🧩 Engine Breakdown

| Engine | File | Core Responsibilities |
| :--- | :--- | :--- |
| **1. Risk Score Core** | `lib/engines/risk-engine.ts` | Normalizes signals into 0–100 score, applies weighted multipliers, determines safety tier. |
| **2. Velocity Engine** | `lib/engines/velocity-engine.ts` | Tracks payee frequency, rapid-fire transactions, and historical baseline deviations. |
| **3. Reputation Engine** | `lib/engines/reputation-engine.ts` | Detects typosquatting, brand impersonation (`sbi-verify.com`), and flagged fraud registries. |
| **4. Document NLP** | `lib/engines/document-engine.ts` | Analyzes uploaded notices/bills for coercive phrases (*"Pay immediately"*, *"Police warrant"*). |
| **5. QR Direction** | `lib/engines/qr-engine.ts` | Resolves UPI intent payloads to prevent reverse-QR scams (*"Scan to receive refund"* fraud). |

---

## 📈 Cumulative Risk Momentum (Salami Slicing)

Rather than evaluating transactions in a vacuum, SENTRA models **risk momentum**. Scammers rarely steal everything in one transaction — they test the waters with repeated micro-transfers while keeping the victim engaged on a call:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SENTRA REAL-TIME RISK ESCALATION PIPELINE                                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [Step 1]  ₹2,000 to New Payee                   ───► Risk Score: 20  [🟢 SAFE]        │
│                                                                                        │
│  [Step 2]  ₹2,000 + Active Call Signal Detected  ───► Risk Score: 42  [🟡 CAUTION]     │
│                                                                                        │
│  [Step 3]  ₹2,000 + Rapid Velocity Multiplier    ───► Risk Score: 68  [🟠 SUSPICIOUS]  │
│                                                                                        │
│  [Step 4]  ₹2,500 + Cumulative Momentum Limit    ───► Risk Score: 92  [🚨 CRITICAL]    │
│                                                                                        │
│  🛡️ ACTION TRIGGERED: Transaction Frozen • 60s Delay • Emergency Guardian Alert Sent   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Threat Intelligence Scanners

SENTRA provides dedicated proactive scanners to protect users before money leaves their account:

<table width="100%">
<tr>
<td width="33%" align="center">
<h3>🌐 URL Threat Scanner</h3>
<p>Scans links sent via SMS, WhatsApp, or email against typo-squatting algorithms and deceptive domains.</p>
<code>app/url-scanner/page.tsx</code>
<br/><br/>
<b>Detects:</b><br/>
<code>sbi-kyc-verify.net</code> vs <code>onlinesbi.sbi</code><br/>
Homoglyphs, IP hostnames, Brand Spoofing
</td>

<td width="33%" align="center">
<h3>📷 Reverse-QR Scanner</h3>
<p>Parses raw UPI QR string payloads to detect the direction of payment flow before authorization.</p>
<code>app/qr-scanner/page.tsx</code>
<br/><br/>
<b>Detects:</b><br/>
Fake <i>"Receive ₹5,000"</i> promises<br/>
Malicious UPI merchants, Dynamic amount injection
</td>

<td width="33%" align="center">
<h3>📄 Document NLP Scanner</h3>
<p>Extracts text from fake electricity bills, courier release orders, and fake cyber-crime warrants.</p>
<code>app/document-scanner/page.tsx</code>
<br/><br/>
<b>Detects:</b><br/>
Coercive payment deadlines<br/>
Fake official seals, Extortion patterns
</td>
</tr>
</table>

---

## 👥 Guardian Family Safety Net

For elderly or vulnerable account holders, SENTRA integrates a **Guardian Circuit-Breaker System**:

```
 ┌────────────────┐          High Risk Detected (Score > 85)          ┌───────────────────┐
 │ Senior Citizen │ ────────────────────────────────────────────────► │ SENTRA Platform   │
 └────────────────┘                                                   └─────────┬─────────┘
                                                                                │
                                           Instant Webhook / SMS Dispatch       ▼
                                                                      ┌───────────────────┐
                                                                      │ Registered Family │
                                                                      │ Guardian Device   │
                                                                      └─────────┬─────────┘
                                                                                │
                                           Guardian One-Click Intervention      ▼
                                                                      ┌───────────────────┐
                                                                      │ [Freeze Account]  │
                                                                      │ [Verify via Call] │
                                                                      └───────────────────┘
```

* **Zero-Friction Notification**: Direct alerts sent to registered loved ones when critical anomalies occur.
* **Audit Trail**: Full chronological event log with context metadata in `app/guardian/page.tsx`.
* **Safe Resumption**: Transactions can be resumed securely once the guardian verifies the recipient.

---

## 📊 Dynamic Risk & Intervention Matrix

| Score Range | Tier Level | Visual Indicator | Immediate Platform Action | Target User Experience |
| :---: | :---: | :---: | :--- | :--- |
| **0 – 25** | `SAFE` | <kbd style="background-color: #22c55e; color: white;">&nbsp;🟢 SAFE&nbsp;</kbd> | Normal authorization pathway | Zero friction, instant payment |
| **26 – 50** | `CAUTION` | <kbd style="background-color: #eab308; color: black;">&nbsp;🟡 CAUTION&nbsp;</kbd> | Contextual prompt displaying payee age | Educational banner highlighting unfamiliarity |
| **51 – 70** | `SUSPICIOUS` | <kbd style="background-color: #f97316; color: white;">&nbsp;🟠 SUSPICIOUS&nbsp;</kbd> | Mandatory call status confirmation | Prompt: *"Are you currently on call with someone instructing you?"* |
| **71 – 85** | `HIGH RISK` | <kbd style="background-color: #ef4444; color: white;">&nbsp;🔴 HIGH RISK&nbsp;</kbd> | 60-second psychological cooldown | Delay timer with verified scenario checklist |
| **86 – 100** | `CRITICAL` | <kbd style="background-color: #7f1d1d; color: white;">&nbsp;🚨 CRITICAL&nbsp;</kbd> | Transaction blocked + Guardian alert | Hard stop. Guardian receives alert with instant freeze |

---

## 💻 Technical Stack

<div align="center">

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | `Next.js 16 (App Router)` • `React 19` • `TypeScript` |
| **UI & Styling** | `Tailwind CSS v4` • `Framer Motion` • `Lucide React` |
| **Data Visualization** | `Recharts (Risk trajectories & anomaly meters)` |
| **Backend & APIs** | `Next.js Route Handlers` • `Server Actions` • `Zod Validation` |
| **Persistence & Models** | `Prisma ORM v5` • `PostgreSQL` • In-Memory Demo Fallback |
| **Document Processing** | `pdf-parse` • `NLP Keyword Context Matrix` |

</div>

---

## 🚀 Developer Quick Start

### ⚡ 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Prathisha-0910/Fraud-detect.git

# Navigate to the project root
cd Fraud-detect

# Install dependencies
npm install
```

### ⚡ 2. Launch Development Server (Instant Demo Mode)

SENTRA includes an **in-memory demo database fallback**, allowing instant testing without any database setup:

```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)** (or `http://localhost:3001` if port 3000 is occupied).

### 🗄️ 3. Optional: Configure PostgreSQL

If connecting to a persistent PostgreSQL instance:

```env
# Create .env file
DATABASE_URL="postgresql://username:password@localhost:5432/sentra_db"
```

```bash
# Generate Prisma Client and push schema
npx prisma generate
npx prisma db push

# Optional: Seed realistic mock transactions
npm run seed
```

---

## 🏆 2-Minute Hackathon Demo Guide

Want to showcase SENTRA’s core value proposition to judges in 120 seconds? Follow this exact flow:

<details open>
<summary><b>▶️ Click to expand the 2-Minute Judge Walkthrough</b></summary>
<br/>

1. **Open the Simulator**: Navigate to `http://localhost:3000/simulator`.
2. **Select the Scam Scenario**: Choose **"Repeated Small Payment Scam (Salami Slicing)"**.
3. **Execute Transaction 1**:
   - Send ₹2,000 to an unverified payee.
   - Result: Risk Score `20` (Green / Safe).
4. **Execute Transaction 2 (With Call Active)**:
   - Toggle **"Active Phone Call"** ON. Send another ₹2,000.
   - Result: Score climbs to `42` (Yellow / Caution prompt displayed).
5. **Execute Transaction 3 (Velocity Build-up)**:
   - Send another ₹2,000 within 2 minutes.
   - Result: Score spikes to `68` (Orange / Suspicious confirmation modal triggered).
6. **Execute Transaction 4 (The Threshold Breaker)**:
   - Send ₹2,500 to a fourth recipient.
   - Result: Score reaches **`92` (CRITICAL ALERT)**.
7. **The Climax**:
   - Transaction is **hard-blocked**.
   - The **Guardian Circuit-Breaker** is tripped.
   - Open `/guardian` to show the real-time alert dispatched to the user's family guardian!

</details>

---

## 🗺️ Future Roadmap

- [x] Multi-engine contextual risk scoring
- [x] QR code reverse-intent direction analyzer
- [x] Document NLP extortion & fake bill scanner
- [x] Guardian circuit-breaker and emergency alert pipeline
- [ ] **Android Accessibility Service Shell**: Native detection of active call state without banking app invasiveness.
- [ ] **Voice Stress & Audio Spectral Analysis**: Background audio AI to detect coercion keywords in real-time.
- [ ] **Cross-Bank Federated Threat Mesh**: Decentralized ledger sharing flagged scam accounts across participating banks.
- [ ] **Regional Language Voice Alerts**: Spoken warnings in Hindi, Tamil, Telugu, Bengali, Marathi, and Kannada.

---

<div align="center">

### 🛡️ SENTRA — Safeguarding Every Rupee

Built with ❤️ for digital banking safety, vulnerable citizens, and fraud prevention.

[![GitHub Stars](https://img.shields.io/github/stars/Prathisha-0910/Fraud-detect?style=social)](https://github.com/Prathisha-0910/Fraud-detect)
[![GitHub Forks](https://img.shields.io/github/forks/Prathisha-0910/Fraud-detect?style=social)](https://github.com/Prathisha-0910/Fraud-detect)

</div>
