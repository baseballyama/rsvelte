<script>
	export let data;
	export let load;
	export let items;
</script>

<button
	on:click={async () => {
		let data = await load();
		if (data) {
			data.isNew = false;
			data.count++;
		}
		items.selected = 1;
		items.count++;
	}}>{data.isNew}{items.selected}</button>
