<script>
	/* eslint svelte/no-unnecessary-state-wrap: ["warn", { "allowReassign": true }] */
	import { SvelteSet } from 'svelte/reactivity';
	let filters = $state(new SvelteSet());
	const hint = `bind:filters`;
</script>

{filters.size}{hint}
