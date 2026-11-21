<script>
	let { 7: seven, '8': eight, 1.5: half, a, ...rest } = $props();
</script>

{seven} {eight} {half} {a} {rest.b}
