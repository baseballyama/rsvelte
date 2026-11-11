<script>
	export let a = 1;
	export let b = 2;
	let c = a === b;
	async function load() {
		return await fetch('/x');
	}
</script>

<p>{c}</p>