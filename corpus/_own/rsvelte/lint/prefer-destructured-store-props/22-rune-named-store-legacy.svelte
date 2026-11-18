<svelte:options runes={false} />
<script>
	import { derived, state, thing } from './stores.js';
	export let flag = true;
</script>

<div>
	{$derived.by}
	{$state.raw}
	{$thing.by}
	{flag}
</div>
