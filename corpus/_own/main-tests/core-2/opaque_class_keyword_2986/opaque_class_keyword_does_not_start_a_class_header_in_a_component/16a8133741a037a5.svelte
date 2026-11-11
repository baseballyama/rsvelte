<script>
	let a = 1;
	let b = 2;
	const pattern = /class /;
	export function make() {
		const flag = $derived(a !== b);
		return { read: () => flag };
	}
</script>

<p>ok</p>
