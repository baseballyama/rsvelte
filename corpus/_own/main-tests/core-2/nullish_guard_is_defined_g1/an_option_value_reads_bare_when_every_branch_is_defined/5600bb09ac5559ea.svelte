<script>
	let n = $state(1);
	let maybe = $state();
</script>

<select><option value={n || 'a'}>logical</option></select>
<select><option value={maybe}>maybe</option></select>
