<script>
	let tag = $state('div');
	let show = $state(true);
</script>

<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
	<foreignObject x="0" y="0" width="10" height="10">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<svg><circle cx="1" cy="1" r="1" /></svg>
		</div>
	</foreignObject>
	<text x="0" y="5">t</text>
	{#if show}
		<g transform="translate(1,1)"><rect width="1" height="1" /></g>
	{/if}
</svg>

<math display="block">
	<mrow><mi>x</mi><mo>=</mo><mn>1</mn></mrow>
	<annotation-xml encoding="text/html"><div>html in math</div></annotation-xml>
</math>

<svelte:element this={tag} class="dyn">child</svelte:element>
<svelte:element this={show ? 'p' : 'span'}>{tag}</svelte:element>
<button onclick={() => (show = !show)}>{show}</button>
