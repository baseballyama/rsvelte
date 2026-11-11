<script module>
	let a = () => 1;
	let s = $state(a);
	export function bump() { s = 1; }
</script>
{1}
