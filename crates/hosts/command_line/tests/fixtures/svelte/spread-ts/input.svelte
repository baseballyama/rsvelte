<script lang="ts">
	let { href, ...rest }: { href?: string; tabindex?: number } = $props();
	const wrong = { tabindex: 'first' };
</script>

<a {href} {...rest}>link</a>
<a {...wrong}>bad tabindex</a>
