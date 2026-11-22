<script lang="ts">
	import StrayBrace from './stray-brace.svelte';
	import Legacy from './stray-brace-legacy.svelte';
	import JavaScript from './stray-brace-javascript.svelte';
	import Async from './stray-brace-async.svelte';
	import Slot from './stray-brace-slot.svelte';
	import Generic from './stray-brace-generic.svelte';
	let legacy: Legacy | undefined;
</script>

<StrayBrace n="x" />
<Legacy n="x" />
<JavaScript n="x" />
<Async n="x" />
<Slot n="x" />
<Generic v={1} n="x" />
<Legacy bind:this={legacy} n={1} />
