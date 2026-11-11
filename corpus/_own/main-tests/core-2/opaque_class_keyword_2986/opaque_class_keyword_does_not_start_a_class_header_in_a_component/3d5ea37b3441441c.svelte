<script>
	let a = 1;
	let b = 2;
	const label = `class name`;
	export function make() {
		const flag = $derived(a !== b);
		return { read: () => flag };
	}
</script>

<p>ok</p>
