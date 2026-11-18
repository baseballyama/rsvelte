<script>
	import Field from './Field.svelte';

	let field = $state(null);
	let text = $state('');
	let valid = $state(true);
	let config = $state({ current: '' });
</script>

<Field bind:this={field} bind:value={text} bind:valid label="combo" />
<Field bind:value={config.current} />
<Field bind:value={() => text, (v) => (text = v.slice(0, 10))} />
<button onclick={() => field?.reset?.()}>{valid}:{text}</button>
