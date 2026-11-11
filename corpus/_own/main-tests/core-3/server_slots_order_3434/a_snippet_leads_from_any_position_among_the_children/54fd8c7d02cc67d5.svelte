<script>
	let { C, n } = $props();
</script>

<C>{#snippet s(v)}<b>{v}</b>{/snippet}<u slot="z">{n}</u><i>{n}</i></C>
