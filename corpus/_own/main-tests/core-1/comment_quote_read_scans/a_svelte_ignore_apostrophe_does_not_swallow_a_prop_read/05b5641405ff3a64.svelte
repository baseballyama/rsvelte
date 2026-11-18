<script>
	export let rows = [];
	export let filterSelections = {};

	$: filteredRows = rows.filter((r) => {
		return Object.keys(filterSelections).every((f) => {
			// svelte-ignore a11y_no_static_element_interactions it's not defined
			if (filterSelections[f] === '') {
				return true;
			}
			return false;
		});
	});
</script>

<div>{filteredRows.length}</div>
