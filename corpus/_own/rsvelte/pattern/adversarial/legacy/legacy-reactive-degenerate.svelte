<script>
	export let a = 1;
	export let b = 2;

	let log = [];

	$: ;
	$: a, b, track();
	$: console.log(a), console.log(b);
	$: arr = [a, ...(arr ?? [])].slice(0, 3);

	function track() {
		log.push(a + b);
		log = log;
	}
</script>

<p>{arr.join('-')}:{log.length}</p>
