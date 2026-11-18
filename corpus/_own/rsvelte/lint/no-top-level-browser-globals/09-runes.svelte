<script>
	const viaDerived = $derived(window.innerWidth);
	const viaDerivedBy = $derived.by(() => window.innerHeight);
	$effect(() => {
		document.title = 'in effect';
	});
	void [viaDerived, viaDerivedBy];
</script>
<p>runes</p>
