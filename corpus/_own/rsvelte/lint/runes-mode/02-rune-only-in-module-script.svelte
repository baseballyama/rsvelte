<script module>
	const holder = { $props: 1 };
	export const label = Object.keys(holder)[0];
</script>

<script>
	export let count;
	let total;
	$: {
		total = count * 2;
	}
</script>

{label}
{total}
