<script>
	import { SvelteSet } from 'svelte/reactivity';
	let s = $state(new SvelteSet());
</script>

{s.size}
