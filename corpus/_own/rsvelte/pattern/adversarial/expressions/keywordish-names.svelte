<script>
	let snippet = $state(1);
	let render = $state(2);
	let each = $state(3);
	let key = $state(4);
	let derived = $state(5);
	let state = $state(6);
	let props = $state(7);
	let bindable = $state(8);
</script>

{#snippet div(html)}
	<span>{html}</span>
{/snippet}

{@render div(snippet + render + each + key)}
<p>{derived + state + props + bindable}</p>

{#key key}
	{@const effect = state * 2}
	<em>{effect}</em>
{/key}
