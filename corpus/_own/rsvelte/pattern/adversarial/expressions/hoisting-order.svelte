<script>
	let n = $state(0);

	const early = compute();

	function compute() {
		return typeof Late;
	}

	class Late {
		static kind = 'late';
	}
</script>

<button onclick={() => (n = helper(n))}>{early}:{Late.kind}:{n}</button>
<p>{helper(1)}</p>

<script module>
	export function helper(x) {
		return x + 1;
	}
</script>
