<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;

	function f() {
		const $state = 1;
		let $derived = 2;

		class $inspect {}

		return $state + $derived + $inspect.name;
	}
</script>

<div>{p} {doubled} {f}</div>
