<script>
	import * as reactivity from 'svelte/reactivity';
	let s = $state(new reactivity.SvelteSet());
</script>

{s.size}
