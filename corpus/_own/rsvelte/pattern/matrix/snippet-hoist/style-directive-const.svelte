{#snippet swatch(color)}
	{@const rgb = `rgb(${color})`}
	<div style:background={rgb}></div>
{/snippet}

{@render swatch('1 2 3')}
