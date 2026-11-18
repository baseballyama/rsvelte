<script>
	export let data;
	export let load;
	export let items;
</script>

<button
	on:click={async () => {
		let data = await load();
		items.selected = data;
		items.pair = [data, data.length];
		items.other = items;
	}}>{data.isNew}{items.selected}</button>
