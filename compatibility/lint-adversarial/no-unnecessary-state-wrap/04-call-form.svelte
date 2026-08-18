<script>
	import { SvelteDate } from 'svelte/reactivity';
	let d = $state(SvelteDate());
</script>

{d}
