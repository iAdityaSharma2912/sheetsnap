<p align="center">

<svg viewBox="0 0 900 200" width="100%" xmlns="http://www.w3.org/2000/svg">

  <style>
    .title {
      font-family: 'Courier New', monospace;
      font-size: 64px;
      fill: #00FFB3;
      letter-spacing: 6px;
    }

    .glitch-layer {
      animation: glitch 2s infinite linear alternate-reverse;
    }

    .glitch-layer:nth-child(2) {
      fill: #ff004c;
      transform: translate(2px, -2px);
      animation-delay: .2s;
    }

    .glitch-layer:nth-child(3) {
      fill: #00e1ff;
      transform: translate(-2px, 2px);
      animation-delay: .4s;
    }

    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }

    .scanline {
      stroke: #00FFB3;
      stroke-width: 1;
      opacity: 0.1;
      animation: scan 3s infinite linear;
    }

    @keyframes scan {
      0% { transform: translateY(-200px); }
      100% { transform: translateY(200px); }
    }
  </style>

  <g>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="title glitch-layer">
      SHEETSNAP
    </text>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="title glitch-layer">
      SHEETSNAP
    </text>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="title glitch-layer">
      SHEETSNAP
    </text>
  </g>

  <line x1="0" y1="0" x2="900" y2="0" class="scanline"/>

</svg>

</p>

<p align="center">
DATA INTERROGATION PROTOCOL v1.0
</p>

---

## SYSTEM BREACH

Modern data tools look powerful.  
They are not.

They sample.  
They approximate.  
They summarize without understanding.  
They hallucinate confidence.

You upload a dataset.  
You receive a decoration.

Insight requires full context.  
Most tools discard it.

---

## SOLUTION: SHEETSNAP

SheetSnap reads everything.

100% of rows.  
100% of columns.  
Zero hallucination.

It does not visualize data for aesthetics.  
It dissects data for truth.

Upload a CSV or Excel file.  
The engine parses every cell.  
AI extracts only validated insight backed by real numbers.

No fluff layer.  
No vague summaries.  
No synthetic intelligence theater.

---

## CORE DIRECTIVES

### FULL DATA ACCESS
Every row is parsed. Nothing ignored.

### COLUMN AUTOPSY
Automatic classification:
- Numeric
- Categorical
- Relational
- Hybrid

### STATISTICAL CORE
Mean  
Median  
Variance  
Standard Deviation  
Distribution Profiles  
Outlier Detection  

Computed instantly.

### VISUAL STRIKE ARRAY (13 MODULES)

Categorical / Relational  
- Horizontal Bar  
- Grouped Bar  
- Stacked Bar  
- Donut Breakdown  

Trend / Distribution  
- Line Trend  
- Area Comparison  
- Histogram Distribution  
- Scatter Correlation  
- Bubble Matrix  

Complex / Variance  
- Radar Profile  
- Radial Performance  
- Composed Total / Average  
- Variance Deviation  

Zero manual configuration.  
Automatic pattern extraction.

---

## AI INTERROGATION TERMINAL

Ask the dataset directly:

```

> highest revenue?
> detect anomalies
> correlate stock and margin
> which region underperformed Q4?

````

Response format:

- Exact numeric values  
- Referenced column names  
- Statistical justification  
- Concise analytical output  

No filler language.  
Only verified extraction.

---

## ARCHITECTURE STACK

Frontend  
React (Vite)  
Recharts  
XLSX  
PapaParse  
Custom Canvas Animations  

Backend  
Vercel Serverless API  
OpenAI GPT-4o Engine  

Deployment  
Vercel Edge Network  

---

## DEPLOYMENT SEQUENCE

### 1 — Clone

```bash
git clone https://github.com/YOUR_USERNAME/SheetSnap.git
cd SheetSnap
````

### 2 — Install

```bash
npm install
```

### 3 — Configure Environment

Create `.env` in root:

```env
VITE_OPENAI_API_KEY=your_key_here
```

### 4 — Run Local

```bash
npm run dev
```

### 5 — Deploy

```bash
vercel
```

---

## ROADMAP: PHASE II

* AI-generated forensic PDF reports
* Predictive forecasting engine
* Multi-operator collaboration
* Dataset mutation tracking
* Enterprise encryption layer
* Offline private inference mode

---

## OPERATOR

Name: Addy
Role: Engineer
Status: Building Relentlessly

---

## FINAL TRANSMISSION

Most tools help you see data.

SheetSnap forces data to confess.

Upload.
Interrogate.
Extract truth.

```
