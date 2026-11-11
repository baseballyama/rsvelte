<script>
	let state = { n: 0 };
	let other = { n: 0 };
	$: setTimeout(() => {
		state.n = state.n + 1;
	});
	$: {
		void other;
		other.n = other.n + 1;
	}
</script>

{state.n}{other.n}
