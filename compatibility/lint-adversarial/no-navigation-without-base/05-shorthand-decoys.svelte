<script>
	let href = '/relative';
	const linkProps = { href: '/spread-bad' };
	void [href, linkProps];
</script>
<a {href}>shorthand never flagged</a>
<a {...linkProps}>spread never flagged</a>
<svelte:element this={'a'} href="/dynamic-el">special element</svelte:element>
<button href="/not-anchor">decoy</button>
