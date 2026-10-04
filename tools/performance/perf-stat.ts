export const HARDWARE_EVENTS = ['cycles', 'instructions', 'L1-dcache-loads', 'L1-dcache-load-misses', 'LLC-loads', 'LLC-load-misses'] as const;
export type HardwareEvent = typeof HARDWARE_EVENTS[number];
export type HardwareCounts = Record<HardwareEvent, number | 'UNMEASURED'>;

export function parsePerfStat(text: string): HardwareCounts {
	const counts = Object.fromEntries(HARDWARE_EVENTS.map(event => [event, 'UNMEASURED'])) as HardwareCounts;
	const seen = new Set<string>();
	for (const line of text.split('\n')) {
		const fields = line.split(';');
		const event = fields[2]?.trim().replace(/:[ukh]+$/, '');
		if (!HARDWARE_EVENTS.some(name => name === event)) continue;
		if (seen.has(event!)) throw new Error(`duplicate perf event ${event}`);
		seen.add(event!);
		const token = fields[0]!.trim();
		if (token === '<not supported>' || token === '<not counted>') continue;
		const value = Number(token);
		if (!token.length || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) throw new Error(`invalid perf count ${token}`);
		counts[event as HardwareEvent] = value;
	}
	return counts;
}
