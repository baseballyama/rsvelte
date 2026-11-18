<script>
	import { SvelteSet, MediaQuery } from 'svelte/reactivity';
	const s = $state(SvelteSet());
	const q = $state.raw(new MediaQuery('x'));
</script>
