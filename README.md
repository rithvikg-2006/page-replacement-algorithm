<<<<<<< HEAD
# Page Replacement Visualizer

A clean, interactive web application for simulating and visualizing **page replacement algorithms** used in Operating Systems memory management. Built with vanilla HTML, CSS, and JavaScript — no dependencies, no build step.

---

## Algorithms Covered

| Algorithm | Strategy | Real-world Use |
|-----------|----------|----------------|
| **FIFO** | Evicts the oldest page in memory | Simple; baseline comparison |
| **LRU** | Evicts the least recently used page | Widely used in OS kernels |
| **Optimal** | Evicts the page needed farthest in the future | Theoretical benchmark only |

---

## Features

- **Compare all three algorithms** side by side in a single run
- **Schedule View** — step-by-step frame state across every reference
- **Detailed Steps** — per-step trace with replaced page and hit/fault result
- **Summary cards** — faults, hits, hit rate, and automatic "Best" detection
- **Random Input** generator for quick experimentation
- Fully responsive — works on desktop and mobile

---

## Getting Started

No installation needed. Just open the file in a browser.

```
page-replacement-visualizer/
└── index.html     ← open this
```

```bash
# Or serve locally with any static server
npx serve .
python3 -m http.server 8080
```

---

## How to Use

1. **Enter a Reference String** — comma or space-separated page numbers  
   e.g. `7, 0, 1, 2, 0, 3, 0, 4, 2, 3` or `7 0 1 2 0 3 0 4 2 3`

2. **Set Memory Frames** — number of physical memory slots available (1–20)

3. **Choose an Algorithm** — run one or compare all three

4. **Click Run Simulation** — results appear instantly on the right

5. **Switch tabs** between Schedule View and Detailed Steps to explore the trace

---

## Sample Input / Output

**Input:**
```
Reference String: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1
Frames: 3
Algorithm: Compare All
```

**Results:**
```
FIFO    → 15 faults, 7 hits,  31.8% hit rate
LRU     → 12 faults, 10 hits, 45.5% hit rate
Optimal →  9 faults, 13 hits, 59.1% hit rate  ★ Best
```

---

## Algorithm Details

### FIFO — First In, First Out
Maintains a queue. When a fault occurs and memory is full, the page that arrived first is evicted. Simple but can behave poorly — susceptible to **Belady's Anomaly** (more frames can cause more faults).

### LRU — Least Recently Used
Tracks the last access time of each page. On a fault, evicts the page that has gone unused for the longest time. Performs well in practice and is the basis for many real OS implementations.

### Optimal (Belady's Algorithm)
Looks ahead at all future references and evicts the page that won't be needed for the longest time. Produces the theoretical minimum number of page faults. Since it requires knowing the future, it cannot be implemented in a real system — it exists only as a benchmark.

---

## Input Rules

- Page numbers must be **non-negative integers**
- Reference string: comma-separated or space-separated
- Frames: integer between **1 and 20**
- Reference strings up to ~1000 entries are supported

---

## File Structure

```
index.html    All UI, styles, and algorithm logic in one self-contained file
README.md     This file
```

The project intentionally uses no frameworks or build tools. All algorithm classes (`FIFO`, `LRU`, `Optimal`) extend a base `PRA` class and share a common step-logging and stats interface.

---

## Browser Support

Works in any modern browser — Chrome, Firefox, Safari, Edge (2020+).

---

## Educational Use

This tool is designed for OS coursework. Suggested uses:

- **Lectures** — demonstrate algorithm behaviour live with custom inputs
- **Labs** — verify student calculations against a known-correct reference
- **Self-study** — use "Compare All" to build intuition for when each algorithm excels

---

## Future Ideas

- Animated step-through with play/pause controls
- Export results as CSV or PDF
- Additional algorithms: Clock, Second Chance, NFU
- Dark mode toggle
- Save/load simulation state via URL params

---

## References

- *Operating System Concepts* — Silberschatz, Galvin & Gagne (Chapter 9: Virtual Memory)
- *Modern Operating Systems* — Tanenbaum (Chapter 3: Memory Management)
=======
# page-replacement-algorithm
>>>>>>> 2dc95905fd3b81c2885f694e96f1cf94298cad7e
