<script lang="ts">
	import Comp from './01-component-basic.svelte';
	type Item = { a: number };
</script>

<Comp>
	{#snippet children(item: Item)}
		<p>{item.a}</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet children()}
		<p>no params</p>
	{/snippet}
</Comp>
