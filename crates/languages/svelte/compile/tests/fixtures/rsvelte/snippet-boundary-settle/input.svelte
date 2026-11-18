<script>
	import Input from './Input.svelte';
	let value = $state('');
</script>
{#snippet row()}<p>{value}</p>{/snippet}
<Input bind:value />
<svelte:boundary>
	{#snippet failed()}<p>failed</p>{/snippet}
	{#snippet other()}<p>other</p>{/snippet}
	{@render other()}
	{@render row()}
</svelte:boundary>
