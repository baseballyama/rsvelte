<script>
	let choice = $state('b');
</script>

<select bind:value={choice}>
	<option>a</option>
	<option value="b">bee</option>
	<option value={'c'} disabled={choice === 'b'}>cee</option>
	<option value={42}>num</option>
	<option value={`t`}>tpl</option>
	<option value={[1, 2]}>arr</option>
	<option value={{ id: 1 }}>obj</option>
</select>
