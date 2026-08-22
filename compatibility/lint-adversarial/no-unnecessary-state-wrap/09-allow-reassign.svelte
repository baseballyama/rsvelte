<script>
	/* eslint svelte/no-unnecessary-state-wrap: ["warn", { "allowReassign": true }] */
	import { SvelteSet } from 'svelte/reactivity';
	let s1 = $state(new SvelteSet());
	let s2 = $state(new SvelteSet());
	function swap() {
		s2 = new SvelteSet();
	}
</script>

<button on:click={swap}>{s1.size}{s2.size}</button>
