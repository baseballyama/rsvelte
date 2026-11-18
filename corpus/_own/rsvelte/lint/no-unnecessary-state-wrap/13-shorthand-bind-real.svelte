<script>
	/* eslint svelte/no-unnecessary-state-wrap: ["warn", { "allowReassign": true }] */
	import { SvelteSet } from 'svelte/reactivity';
	import Child from './Child.svelte';
	let sel = $state(new SvelteSet());
</script>

<Child bind:sel />
