<script>
	let { a = () => 1 } = $props();
	let s = $state(0);
	export function go() { s = a; }
</script>
{s}
