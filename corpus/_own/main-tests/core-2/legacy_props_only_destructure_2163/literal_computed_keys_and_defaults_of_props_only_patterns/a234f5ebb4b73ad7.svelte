<script>
	const key = 'd';
	export let a = 1;
	export let bc = 0;
	export let three = 0;
	export let dee = 0;
	const obj = { a: 1 };
	function f() { ({ a = 5, 'b-c': bc, 3: three, [key]: dee } = obj); }
</script>
<button onclick={f}>{a} {bc} {three} {dee}</button>