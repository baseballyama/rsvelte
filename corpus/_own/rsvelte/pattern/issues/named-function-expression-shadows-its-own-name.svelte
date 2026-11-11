<script>
	let base = $state(1);
	let v = $derived(base);
	let { w } = $props();

	const shadowed = function v() {
		return typeof v;
	};

	const shadowed_prop = function w() {
		return typeof w;
	};

	function unshadowed() {
		const inner = function other() {
			return [v, w, other];
		};
		return inner();
	}
</script>

<button onclick={() => console.log(shadowed(), shadowed_prop(), unshadowed())}></button>
<button onclick={() => {
	const handler = function v() {
		return typeof v;
	};
	console.log(handler(), v, w);
}}></button>
{v}
{w}
