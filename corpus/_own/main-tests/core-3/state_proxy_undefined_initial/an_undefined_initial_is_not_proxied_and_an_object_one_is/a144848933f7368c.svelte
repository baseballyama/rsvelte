<script>
	let { a } = $props();
	let s = $state(0);
	export function go() { s = a; }
</script>
{s}
