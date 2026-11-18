<script>
	import A from './A.svelte';
	import * as NS from './lib.js';
	import { widgets } from './registry.js';

	let which = $state(true);
	let Dyn = $derived(which ? A : NS.B);
	const table = { deep: { C: A } };
</script>

<A class="x" style="color: red" {which} prop={1} />
<Dyn label="dynamic" />
<NS.B />
<table.deep.C nested />
<svelte:component this={which ? A : widgets['fancy']} legacy="yes" />

{#each [A, NS.B] as Item}
	<Item inline />
{/each}
