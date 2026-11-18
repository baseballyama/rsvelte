<script module>
	import { browser } from './environment.js';

	export const label = browser ? 'browser' : 'server';
</script>

<script>
	import { onMount } from 'svelte';

	let count = $state(0);
	onMount(() => count++);
</script>

<p>{label} {count}</p>
