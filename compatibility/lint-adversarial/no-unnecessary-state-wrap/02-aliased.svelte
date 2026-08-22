<script>
	import { SvelteMap as M } from 'svelte/reactivity';
	let m = $state(new M());
</script>

{m.size}
