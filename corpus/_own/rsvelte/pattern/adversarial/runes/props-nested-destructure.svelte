<script>
	let { config = {}, handlers = {} } = $props();
	let { theme = 'light', sizes: [small = 1, ...bigger] = [] } = $derived(config);
	let onpick = $derived(handlers.onpick ?? (() => {}));
</script>

<button class={theme} onclick={() => onpick(small)}>{bigger.length}</button>
