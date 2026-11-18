<script>
	let { ...attrs } = $props();
	let text = $state('');
	let checked = $state(false);
</script>

<input {...attrs} />
<input {...attrs} bind:value={text} />
<input type="checkbox" {...attrs} bind:checked />
<input {...attrs} value={text} defaultValue="seed" />
<p>{text} {checked}</p>
