<script>
	export let id;
	let n = 0;

	$: if (id) {
		sub()
			// } c
			.catch((e) => {
				n = 2;
			});
	}
</script>

<button>{n}</button>
