<svelte:options customElement={{ tag: 'rsvelte-host-repro', shadow: 'none' }} />

<script>
	let { label = 'w', count = 0 } = $props();
	const host = $host();

	function emit() {
		host.dispatchEvent(new CustomEvent('picked', { detail: count }));
	}
</script>

<button onclick={emit}>{label}:{count}</button>
