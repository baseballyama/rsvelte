<script>
	let { C, n } = $props();
</script>

<C><u slot="z">{n}</u><i>{n}</i>{#snippet s(v)}<b>{v}</b>{/snippet}</C>
