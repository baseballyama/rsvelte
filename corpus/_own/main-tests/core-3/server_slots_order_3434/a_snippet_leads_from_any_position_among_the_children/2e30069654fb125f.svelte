<script>
	let { C, n } = $props();
</script>

<C><u slot="z">{n}</u>{#snippet s(v)}<b>{v}</b>{/snippet}<i>{n}</i></C>
