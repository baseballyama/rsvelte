<script>
	let n = $state(1);
	let maybe = $state();
</script>

<select><option value={n ? 'a' : 'b'}>ternary</option></select>
<select><option value={n || 'a'}>logical</option></select>
<select><option value={maybe}>possibly undefined</option></select>
