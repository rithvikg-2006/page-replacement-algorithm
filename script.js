
    function parseReferenceString(input) {
        if (!input.trim()) throw new Error('Reference string is empty');
        const sep = input.includes(',') ? ',' : /\s+/;
        return input.split(sep).map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    }
    function generateRandom(len = 20) {
        return Array.from({ length: len }, () => Math.floor(Math.random() * 8)).join(', ');
    }
    function showError(msg) {
        const el = document.getElementById('errorMessage');
        el.textContent = msg; el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    }

    class PRA {
        constructor(ref, frames) {
            this.referenceString = ref; this.numFrames = frames;
            this.frames = []; this.steps = []; this.pageFaults = 0; this.pageHits = 0;
        }
        snap() { return [...this.frames]; }
        push(ref, hit, rep = null) { this.steps.push({ reference: ref, frames: this.snap(), isHit: hit, replacedPage: rep }); }
        stats() {
            const n = this.referenceString.length;
            return { references: n, frames: this.numFrames, faults: this.pageFaults, hits: this.pageHits,
                hitRate: n > 0 ? ((this.pageHits / n) * 100).toFixed(1) : 0 };
        }
    }

    class FIFO extends PRA {
        simulate() {
            for (const page of this.referenceString) {
                if (this.frames.includes(page)) { this.pageHits++; this.push(page, true); }
                else {
                    this.pageFaults++;
                    let rep = null;
                    if (this.frames.length < this.numFrames) this.frames.push(page);
                    else { rep = this.frames.shift(); this.frames.push(page); }
                    this.push(page, false, rep);
                }
            }
        }
    }

    class LRU extends PRA {
        simulate() {
            const lu = new Map();
            for (let i = 0; i < this.referenceString.length; i++) {
                const page = this.referenceString[i];
                if (this.frames.includes(page)) { this.pageHits++; lu.set(page, i); this.push(page, true); }
                else {
                    this.pageFaults++; let rep = null;
                    if (this.frames.length < this.numFrames) { this.frames.push(page); lu.set(page, i); }
                    else {
                        let lp = this.frames[0], mt = lu.get(lp) ?? -1;
                        for (const f of this.frames) { const t = lu.get(f) ?? -1; if (t < mt) { mt = t; lp = f; } }
                        rep = lp; this.frames.splice(this.frames.indexOf(lp), 1);
                        this.frames.push(page); lu.set(page, i);
                    }
                    this.push(page, false, rep);
                }
            }
        }
    }

    class Optimal extends PRA {
        simulate() {
            for (let i = 0; i < this.referenceString.length; i++) {
                const page = this.referenceString[i];
                if (this.frames.includes(page)) { this.pageHits++; this.push(page, true); }
                else {
                    this.pageFaults++; let rep = null;
                    if (this.frames.length < this.numFrames) this.frames.push(page);
                    else {
                        const future = this.referenceString.slice(i + 1);
                        let far = this.frames[0], maxD = -1;
                        for (const p of this.frames) {
                            const nx = future.indexOf(p);
                            if (nx === -1) { far = p; break; }
                            if (nx > maxD) { maxD = nx; far = p; }
                        }
                        rep = far; this.frames.splice(this.frames.indexOf(far), 1); this.frames.push(page);
                    }
                    this.push(page, false, rep);
                }
            }
        }
    }

    const META = {
        fifo:    { label: 'FIFO',    css: 'fifo',    dot: 'var(--fifo-color)', bar: 'var(--fifo-color)' },
        lru:     { label: 'LRU',     css: 'lru',     dot: 'var(--lru-color)',  bar: 'var(--lru-color)'  },
        optimal: { label: 'Optimal', css: 'optimal', dot: 'var(--opt-color)',  bar: 'var(--opt-color)'  }
    };

    function renderSummary(results) {
        const c = document.getElementById('summaryCards'); c.innerHTML = '';
        const algos = Object.keys(results);
        const best = algos.reduce((b, a) => !b || results[a].stats.faults < results[b].stats.faults ? a : b, null);
        for (const [algo, data] of Object.entries(results)) {
            const s = data.stats, m = META[algo];
            c.innerHTML += `<div class="stat-card ${m.css}">
                <div class="stat-top-bar" style="background:${m.bar}"></div>
                ${algo === best ? '<div class="best-tag">★ Best</div>' : ''}
                <div class="card-algo-name">${m.label}</div>
                <div class="metrics">
                    <div class="metric-item"><label>Faults</label><div class="num is-fault">${s.faults}</div></div>
                    <div class="metric-item"><label>Hits</label><div class="num is-hit">${s.hits}</div></div>
                    <div class="metric-item"><label>Hit Rate</label><div class="num">${s.hitRate}%</div></div>
                    <div class="metric-item"><label>Total</label><div class="num">${s.references}</div></div>
                </div>
            </div>`;
        }
    }

    function renderSchedule(results, sel) {
        const c = document.getElementById('scheduleContent'); c.innerHTML = '';
        const algos = sel === 'all' ? ['fifo','lru','optimal'] : [sel];
        for (const algo of algos) {
            const { steps, algorithm: alg } = results[algo];
            const m = META[algo];
            let headers = '<th>Step</th><th>Ref</th>';
            for (let i = 0; i < alg.numFrames; i++) headers += `<th>F${i+1}</th>`;
            headers += '<th>Result</th>';
            let rows = '';
            steps.forEach((step, i) => {
                let cells = '';
                for (let f = 0; f < alg.numFrames; f++) {
                    const pg = step.frames[f];
                    if (pg != null) cells += pg === step.replacedPage
                        ? `<td><span class="replaced-val">${pg}</span></td>`
                        : `<td>${pg}</td>`;
                    else cells += '<td style="color:var(--text-hint)">—</td>';
                }
                rows += `<tr>
                    <td style="color:var(--text-hint);font-size:11px;font-family:var(--mono)">${i+1}</td>
                    <td><strong style="font-family:var(--mono)">${step.reference}</strong></td>
                    ${cells}
                    <td class="${step.isHit ? 'hit-cell' : 'fault-cell'}">${step.isHit ? '✓ Hit' : '✗ Fault'}</td>
                </tr>`;
            });
            c.innerHTML += `<div class="sched-block">
                <div class="block-label">
                    <span class="block-label-dot" style="background:${m.dot}"></span>${m.label}
                </div>
                <div class="table-scroll">
                    <table class="sched-table">
                        <thead><tr>${headers}</tr></thead><tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
        }
    }

    function renderDetailed(results, sel) {
        const c = document.getElementById('detailedContent'); c.innerHTML = '';
        const algos = sel === 'all' ? ['fifo','lru','optimal'] : [sel];
        for (const algo of algos) {
            const { steps } = results[algo]; const m = META[algo];
            let rows = '';
            steps.forEach((step, i) => {
                const chips = step.frames.length
                    ? step.frames.map(f => `<span class="frame-chip">${f}</span>`).join('')
                    : '<span class="frame-chip empty">empty</span>';
                const repText = step.replacedPage != null
                    ? `<span style="color:var(--replaced);font-family:var(--mono);font-weight:600">${step.replacedPage}</span>` : '—';
                rows += `<tr>
                    <td><span class="step-num">${i+1}</span></td>
                    <td><span class="ref-badge">${step.reference}</span></td>
                    <td><div class="frames-list">${chips}</div></td>
                    <td>${repText}</td>
                    <td><span class="result-chip ${step.isHit ? 'hit' : 'fault'}">${step.isHit ? '✓ Hit' : '✗ Fault'}</span></td>
                </tr>`;
            });
            c.innerHTML += `<div class="detail-block">
                <div class="detail-block-title">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${m.dot}"></span>
                    ${m.label} — Detailed Trace
                </div>
                <div class="table-scroll">
                    <table class="detail-table">
                        <thead><tr><th>Step</th><th>Page</th><th>Frames</th><th>Replaced</th><th>Result</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
        }
    }

    function showResults(results, sel) {
        renderSummary(results); renderSchedule(results, sel); renderDetailed(results, sel);
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('resultsWrap').classList.add('visible');
        setTimeout(() => document.getElementById('resultsWrap').scrollIntoView({ behavior: 'smooth' }), 80);
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('inputForm').addEventListener('submit', function (e) {
        e.preventDefault();
        try {
            const ref = parseReferenceString(document.getElementById('referenceString').value);
            const frames = parseInt(document.getElementById('numFrames').value);
            const sel = document.getElementById('algorithm').value;
            if (!ref.length) { showError('Please enter a valid reference string'); return; }
            if (frames < 1 || frames > 20) { showError('Frames must be between 1 and 20'); return; }
            if (ref.some(p => p < 0)) { showError('Page numbers must be non-negative'); return; }
            const map = { fifo: FIFO, lru: LRU, optimal: Optimal };
            const algos = sel === 'all' ? ['fifo','lru','optimal'] : [sel];
            const results = {};
            for (const a of algos) {
                const inst = new map[a](ref, frames); inst.simulate();
                results[a] = { algorithm: inst, steps: inst.steps, stats: inst.stats() };
            }
            showResults(results, sel);
        } catch (err) { showError('Error: ' + err.message); }
    });

    document.getElementById('randomBtn').addEventListener('click', () => {
        document.getElementById('referenceString').value = generateRandom(20);
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('referenceString').value = '7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1';
        document.getElementById('numFrames').value = '3';
        document.getElementById('algorithm').value = 'all';
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('resultsWrap').classList.remove('visible');
        document.getElementById('errorMessage').style.display = 'none';
    });