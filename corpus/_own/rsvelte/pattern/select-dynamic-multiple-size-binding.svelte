<script>
	let width = $state(0);
	let many = $state(false);
</script>

<select multiple={many} bind:clientWidth={width}>
	<option>one</option>
</select>
