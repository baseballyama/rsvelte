<script>
	let input = $state('abc123');
	const patterns = [
		/(?<year>\d{4})-(?<month>\d{2})/u,
		/(?<=\$)\d+/g,
		/\p{Script=Hiragana}+/u,
		/[\p{L}--[a-z]]/v,
		/a\/b/dgi,
		/[/]/,
	];
	let matched = $derived(patterns.filter((p) => p.test(input)).length);
</script>

<input bind:value={input} pattern="[a-z]+\d*" />
<p>{matched}/{patterns.length}</p>
<p>{(/^x/y).test(input) ? 'sticky' : input.replace(/(\d)(?=(\d{3})+$)/g, '$1,')}</p>
