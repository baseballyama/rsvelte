<script lang="ts">
	const raw: unknown = 'x';
</script>

{#snippet row<T>(item: T)}
	<span>{String(item)}</span>
{/snippet}

<p>{<string>raw}{(<number>raw).toFixed(1)}</p>
{@render row(1)}
<p>{(<string>raw).toFixed(1)}{<Missing>raw}</p>
