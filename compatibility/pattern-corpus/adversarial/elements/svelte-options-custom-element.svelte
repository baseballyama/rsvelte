<svelte:options
	customElement={{
		tag: 'my-widget',
		shadow: 'none',
		props: {
			label: { reflect: true, type: 'String', attribute: 'data-label' },
			count: { type: 'Number' },
		},
		extend: (cls) => class extends cls {},
	}}
/>

<script>
	let { label = 'w', count = 0 } = $props();
	const host = $host();

	function emit() {
		host.dispatchEvent(new CustomEvent('picked', { detail: count }));
	}
</script>

<button onclick={emit}>{label}:{count}</button>
