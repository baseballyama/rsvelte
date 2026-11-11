<script>
	import C from './C.svelte';
	let items = [1, 2];
</script>

<C><p slot="beta">{#each items as n}<b>{n}</b>{/each}</p><span>{#each items as _, n}<u>{n}</u>{/each}</span></C>
