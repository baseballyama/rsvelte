<script>
	import List from './List.svelte';

	export let handler;
	export let action;
	export let fade;
</script>

<List let:item let:index={i}>
	<span>{item}{i}</span>
	<svelte:fragment slot="footer" let:row>
		<span>{row}</span>
	</svelte:fragment>
</List>

<button on:click|once|preventDefault={handler} use:action transition:fade|local>
	control
</button>
