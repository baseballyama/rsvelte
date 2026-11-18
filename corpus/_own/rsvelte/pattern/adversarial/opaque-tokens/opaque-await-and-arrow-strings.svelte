<script>
	let status = $state('idle');
	const doc = 'use await inside async, x => y outside';
	const chain = `a => b => c`;

	async function run() {
		status = 'before';
		await Promise.resolve(doc);
		status = chain.includes('=>') ? 'done' : 'never';
	}
</script>

<button onclick={run}>{status}</button>
