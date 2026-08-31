<script>
	let base = $state(1);
	let v = $derived(base);
	let { w } = $props();

	function declares() {
		class v {}
		class w {}
		return typeof v + typeof w;
	}

	function sibling() {
		return typeof v + typeof w;
	}
</script>

<button
	onclick={() => {
		class v {}
		function w() {}
		console.log(typeof v, typeof w);
	}}
></button>
<button onclick={() => console.log(typeof v, typeof w)}></button>
{declares()}{sibling()}{v}{w}
