<script>
	class SvelteSet {
		size = 0;
	}
	let s = $state(new SvelteSet());
	let n = $state(0);
</script>

{s.size}{n}
