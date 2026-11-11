<script>
	let base = $state(1);
	let v = $derived(base);
	let { w } = $props();

	function hoisted() {
		const a = typeof v;
		const b = typeof w;
		function v() {}
		var w = 1;
		return a + b + w;
	}

	function tdz() {
		const a = typeof v;
		const b = typeof w;
		let v = 1;
		class w {}
		return a + b;
	}

	function sibling() {
		return typeof v + typeof w;
	}
</script>

<button
	onclick={() => {
		base = (typeof v).length;
		function v() {}
	}}
></button>
{hoisted()}{tdz()}{sibling()}{v}{w}
