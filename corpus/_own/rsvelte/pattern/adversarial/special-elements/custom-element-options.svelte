<svelte:options
	customElement={{
		tag: 'my-counter',
		shadow: 'none',
		props: { count: { reflect: true, type: 'Number', attribute: 'data-count' } },
		extend: (customElementConstructor) => customElementConstructor
	}}
/>

<script>
	let { count = 0 } = $props();
</script>

<button onclick={() => count++}>{count}</button>
