<script>
	let { header, children, footer } = $props();
</script>

<header>{@render header?.('big')}</header>
<main>{@render children()}</main>
<footer>{@render footer?.()}</footer>
