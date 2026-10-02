<script lang="ts">
	import Foo from './Foo.svelte';
</script>

<div>
	<!-- The snippet is not used. -->
	{#snippet children()}
		<th>fruit</th>
		<th>qty</th>
		<th>price</th>
		<th>total</th>
	{/snippet}
</div>

<Foo>
	<!-- The snippet is used and does not add any variables. -->
	{#snippet children(arg)}
		<p>{arg}</p>
	{/snippet}
	{#snippet c()}
		<Foo>
			<!-- The snippet is used and does not add any variables. -->
			{#snippet children(arg)}
				<p>{arg}</p>
			{/snippet}
		</Foo>
	{/snippet}
</Foo>

<!-- The snippet is used and add a variable. -->
{#snippet bar(arg)}
	<p>{arg}</p>
{/snippet}
<Foo children={bar}>
	{#snippet c()}
		<!-- The snippet is used and add a variable. -->
		{#snippet bar(arg)}
			<p>{arg}</p>
		{/snippet}
		<Foo children={bar}>
		</Foo>
	{/snippet}
</Foo>
