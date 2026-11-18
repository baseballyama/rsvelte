<script>
	let n = $state(1);
</script>

{#snippet div(x)}
	<b>{x}</b>
{/snippet}
{#snippet button(x)}
	{@render div(x + 1)}
{/snippet}

{@render div(n)}
{@render button(n)}
<div>real element</div>
<button onclick={() => n++}>real button</button>
