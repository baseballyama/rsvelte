{#snippet swatch(color)}
	{@const attachment = (node) => node.setAttribute('data-color', color)}
	<div {@attach attachment}></div>
{/snippet}

{@render swatch('red')}
