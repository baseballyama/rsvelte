<script>
	export let a = 1;
	let a2 = 1;
	export { a2 };
	let b = 2;
	export { b as c };
	export let { d, e: [f] } = {};
</script>
