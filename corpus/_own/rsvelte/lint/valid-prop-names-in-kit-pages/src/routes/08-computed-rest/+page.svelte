<script>
	let { ['data']: d, ...rest } = $props();
	let { bogus } = $props();
	void [d, rest, bogus];
</script>
<p>computed</p>
