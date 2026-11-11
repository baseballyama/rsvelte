<script>
	let { a = undefined } = $props();
	let s = $state(0);
	export function go() { s = a; }
</script>
{s}
