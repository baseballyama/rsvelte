<script module>
	import { tick } from 'svelte';

	export const SHARED = { count: 0 };

	export function bump() {
		SHARED.count += 1;
		return tick();
	}

	let moduleLevel = 0;
</script>

<script>
	let local = $state(SHARED.count);

	async function run() {
		await bump();
		moduleLevel += 1;
		local = SHARED.count + moduleLevel;
	}
</script>

<button onclick={run}>{local}{SHARED.count}</button>
