<script>
	export let filter = { group: undefined };
	export let editor = null;
	export let files = [];

	function normalize(filters) {
		for (const filter of filters) {
			filter.group = 'top';
		}
	}

	const onCreate = ({ editor }) => {
		editor.storage.files = files;
	};
</script>

<button
	on:click={() => {
		normalize([]);
		onCreate({ editor });
	}}>{filter.group}{files.length}</button
>
