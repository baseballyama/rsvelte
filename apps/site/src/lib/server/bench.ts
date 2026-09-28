import metricsA from '$lib/data/bench/metrics-a.json';
import metricsB from '$lib/data/bench/metrics-b.json';
import plainA from '$lib/data/bench/plain-a.json';
import plainB from '$lib/data/bench/plain-b.json';

export interface ArmSummary {
	name: string;
	/** Median ms of each plain build, then of each metrics build. */
	plain: number[];
	metrics: number[];
	allocs: number;
	allocBytes: number;
	allocsPerByte: number;
	peak: number;
}

function num(v: unknown, what: string): number {
	if (typeof v !== 'number') throw new Error(`${what} is ${JSON.stringify(v)}, not a number`);
	return v;
}

export function arms(): ArmSummary[] {
	return plainA.arms.map((a) => {
		const pick = (r: { arms: { name: string }[] }) => {
			const x = r.arms.find((y) => y.name === a.name);
			if (!x) throw new Error(`arm ${a.name} missing from a report`);
			return x as Record<string, unknown>;
		};
		const m = pick(metricsA);
		return {
			name: a.name,
			plain: [plainA, plainB].map((r) => num(pick(r).median_ms, `${a.name}.median_ms`)),
			metrics: [metricsA, metricsB].map((r) => num(pick(r).median_ms, `${a.name}.median_ms`)),
			allocs: num(m.allocs, `${a.name}.allocs`),
			allocBytes: num(m.alloc_bytes, `${a.name}.alloc_bytes`),
			allocsPerByte: num(m.allocs_per_source_byte, `${a.name}.allocs_per_source_byte`),
			peak: num(m.peak_live_growth_bytes, `${a.name}.peak_live_growth_bytes`)
		};
	});
}

export function arm(name: string): ArmSummary {
	const a = arms().find((x) => x.name === name);
	if (!a) throw new Error(`no arm ${name}`);
	return a;
}

export function reports() {
	return { plainA, plainB, metricsA, metricsB };
}

/** Average self microseconds per call of every phase in the first metrics report. */
export function phaseAverages(): Record<string, number> {
	const phases = metricsA.phases;
	if (!Array.isArray(phases)) throw new Error('metrics-a.json has no phase table');
	return Object.fromEntries(phases.map((p) => [p.name, (num(p.self_ms, `${p.name}.self_ms`) * 1000) / num(p.calls, `${p.name}.calls`)]));
}

export function phaseTable() {
	const phases = metricsA.phases;
	if (!Array.isArray(phases)) throw new Error('metrics-a.json has no phase table');
	return phases;
}

/** Documents every report measured; the four runs must agree or the comparison is between populations. */
export function documents(): number {
	const counts = Object.entries(reports()).map(([k, r]) => num(r.population.documents, `${k}.population.documents`));
	if (new Set(counts).size !== 1) throw new Error(`reports disagree on the population: ${counts.join(', ')}`);
	return counts[0];
}
