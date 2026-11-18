<script>
	export let collection;
	export let flagged;
	export let ready;

	function multiline() {
		collection.items =
			collection.items.filter(
				(it) => it.kind === 'note'
			);
	}

	function single() {
		collection.items = collection.items.filter((it) => it.id !== 1);
	}

	function commented() {
		collection.mark = flagged; // will this somehow be handled automatically?
	}

	function literal() {
		collection.mark = true;
	}

	$: if (ready) {
		collection.items = collection.items.filter((it) => it.id !== 1);
	}
</script>

<button on:click={() => (collection.items = collection.items.filter((it) => it.id !== 1))}>go</button>
