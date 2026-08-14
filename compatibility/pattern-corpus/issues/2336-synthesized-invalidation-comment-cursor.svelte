<script>
	let options = { currentPage: 0, rowsPerPage: 1 };

	function update() {
		// retained comment
		options.currentPage = 1;
		// discarded comment
	}

	function updatePageSize() {}
</script>

<select bind:value={options.rowsPerPage} onchange={updatePageSize}></select>
