<script lang="ts">
	let { obj }: { obj?: { field: string } } = $props();
</script>

<p>{obj!.field}</p>
<div title={obj!.field}></div>
{#if obj!.field}<span>{obj!.field}</span>{/if}
