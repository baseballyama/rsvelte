<script>
	let a = $state({ id: 'x', title: 't1' });
	let b = $state({ title: 't2', hidden: true });
	let value = $state('v');
</script>

<input {...a} class="fixed" {...b} {value} type="text" {...{ 'data-last': 1 }} />
<div {...a} onclick={() => (value = 'clicked')} {...b} role="button" tabindex="0">x</div>
