<script>
	import { SvelteSet } from 'svelte/reactivity';
	let s = $state(new SvelteSet());
</script>
<button onclick={() => (s = new SvelteSet())}>x</button>