<script module>
	let a = () => 1;
	let s = $state(0);
	export function go() { s = a; }
</script>
{1}
