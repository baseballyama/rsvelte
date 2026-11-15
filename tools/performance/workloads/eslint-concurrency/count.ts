// An ESLint formatter that prints only counts, so printing 750,000 findings costs no memory.
type Result = { messages: { ruleId: string | null }[] };

export default function count(results: Result[]): string {
	const rules: Record<string, number> = {};
	let findings = 0;
	for (const result of results)
		for (const message of result.messages) {
			const rule = message.ruleId ?? '(fatal)';
			rules[rule] = (rules[rule] ?? 0) + 1;
			findings++;
		}
	return JSON.stringify({ files: results.length, findings, rules });
}
