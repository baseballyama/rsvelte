<script>
	let picked = $state('b');
	let text = $state('typed');
	let on = $state(true);
</script>

<select value={picked}>
	<option value="a">a</option>
	<option value="b">b</option>
</select>

<select multiple value={['a', 'b']}>
	<option value="a">a</option>
	<option value="b">b</option>
</select>

<textarea value={text}></textarea>
<input value={text} />
<input type="checkbox" checked={on} />
<input type="radio" name="g" value="r1" checked={!on} />
<option value={null}>null value</option>
