<script>
	export let seed;
	const holder = { $bindable: 1 };
	let a;
	$: a = 'init';
	void [seed, holder];
</script>

{a}
