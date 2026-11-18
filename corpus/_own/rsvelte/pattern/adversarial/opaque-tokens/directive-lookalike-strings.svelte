<script>
	const spread = { 'on:click': 'literal', 'bind:value': 'literal', 'use:action': 'literal' };
	const text = 'on:click={handler} bind:value use:action';
	let n = $state(0);
</script>

<div {...spread} data-text={text}>{text}</div>
<div data-a="on:click={n}" data-b="bind:value" data-c={'use:x'}>{n}</div>
<div title="class:active style:color animate:flip">t</div>
<p>{'{#if}'} {'{/each}'} {'{@html}'}</p>
