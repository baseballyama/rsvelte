<script>
	let x = $state();
	let t = $state(false);
</script>

<select multiple={t} bind:toString={x}></select>
