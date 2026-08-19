<script>
	let x = 'a';
</script>

<div style="color: {x === '}' ? 'red' : 'blue'}">a</div>
<div style="color: {x === '{' ? 'red' : 'blue'}; margin: 0">b</div>
<div style="color: {`}${x}`}">c</div>
