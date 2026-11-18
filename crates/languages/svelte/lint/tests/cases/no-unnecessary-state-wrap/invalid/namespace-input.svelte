<script>
	import * as reactivity from 'svelte/reactivity';
	const s = $state(new reactivity.SvelteSet());
	const { a } = $state(new reactivity.SvelteMap());
	let b;
	b = $state(new reactivity.SvelteMap());
</script>
