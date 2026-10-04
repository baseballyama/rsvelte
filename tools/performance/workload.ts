export type Arm = { name: string; command: [string, ...string[]] };
export type Workload = {
	rounds: number; repetitions: number; arms: Arm[];
	expect_stdout?: Record<string, string | number | boolean>;
	minimum_output_bytes?: number;
};

export function validateWorkload(config: Workload): void {
	for (const value of [config.rounds, config.repetitions]) if (!Number.isSafeInteger(value) || value < 1) throw new Error('invalid measurement population');
	if (!Array.isArray(config.arms) || !config.arms.length || new Set(config.arms.map(arm => arm.name)).size !== config.arms.length) throw new Error('invalid measurement arms');
	for (const arm of config.arms) {
		if (typeof arm.name !== 'string' || !Array.isArray(arm.command) || !arm.command.length || arm.command.some(value => typeof value !== 'string')) throw new Error('invalid arm command');
	}
	if (config.minimum_output_bytes !== undefined && (!Number.isSafeInteger(config.minimum_output_bytes) || config.minimum_output_bytes < 1)) throw new Error('invalid minimum output size');
	if (config.expect_stdout !== undefined) {
		if (config.expect_stdout === null || typeof config.expect_stdout !== 'object' || Array.isArray(config.expect_stdout)) throw new Error('invalid expected workload output');
		for (const value of Object.values(config.expect_stdout)) {
			if (!['string', 'number', 'boolean'].includes(typeof value) || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('invalid expected workload value');
		}
	}
}

export function validateWorkloadOutput(config: Workload, text: string): void {
	if (config.expect_stdout === undefined && config.minimum_output_bytes === undefined) return;
	const stdout: unknown = JSON.parse(text);
	if (stdout === null || typeof stdout !== 'object' || Array.isArray(stdout)) throw new Error('workload output must be an object');
	const record = stdout as Record<string, unknown>;
	for (const [key, value] of Object.entries(config.expect_stdout ?? {})) {
		if (record[key] !== value) throw new Error(`workload ${key}: expected ${JSON.stringify(value)}, got ${JSON.stringify(record[key])}`);
	}
	if (config.minimum_output_bytes !== undefined && (typeof record.output_bytes !== 'number' || !Number.isSafeInteger(record.output_bytes) || record.output_bytes < config.minimum_output_bytes)) throw new Error('workload emitted too few output bytes');
}

export function* sampleOrder<T>(arms: readonly T[], repetitions: number): Generator<T> {
	for (let repetition = 0; repetition < repetitions; repetition++) {
		yield* arms;
		yield* arms.toReversed();
	}
}
