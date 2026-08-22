<script>
	import { SvelteSet } from 'svelte/reactivity';
	class Holder {
		s = $state(new SvelteSet());
	}
	const h = new Holder();
	let t = $state(null);
	t = $state(new SvelteSet());
</script>

{h.s.size}{t}
