<script>
	export let item;

	let flag =
		item.a !== undefined ||
		item.b !== undefined;

	$: kind =
		item?.meta?.type ===
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
		item?.name === 'doc';

	export let width = 1;
	export let height = 2;

	function toggle() {
		flag = true;
	}
</script>

<button on:click={toggle}>{flag}{kind}{width}{height}</button>
