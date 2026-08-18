<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	let s = $state<SvelteSet<number>>(new SvelteSet<number>());
</script>

{s.size}
