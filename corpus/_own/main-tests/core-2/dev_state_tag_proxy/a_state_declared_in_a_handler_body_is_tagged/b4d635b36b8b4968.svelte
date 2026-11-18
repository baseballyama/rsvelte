<script>
	import { SvelteSet } from 'svelte/reactivity';

	const set = new SvelteSet();
</script>

<button onclick={() => {
	const entry = $state({ name: 'a' });
	set.add(entry);
}}>add</button>
