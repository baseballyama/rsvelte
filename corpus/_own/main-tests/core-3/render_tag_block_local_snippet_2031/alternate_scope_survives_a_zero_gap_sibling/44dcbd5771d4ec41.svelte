<script>
	let a = $state(false);
	let { row } = $props();
</script>
{#if a}<p>A</p>{:else}{@render row()}{/if}<div>{#snippet row()}<b>r</b>{/snippet}</div>