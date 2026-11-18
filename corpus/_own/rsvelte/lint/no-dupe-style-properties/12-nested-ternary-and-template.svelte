<script>
	let a = true;
	let b = false;
	let c = 'red';
</script>

<div style="{a ? (b ? 'color: red' : 'color: blue') : 'color: green'}">a</div>
<div style={`color: ${c}; color: blue`}>b</div>
<div style="{`color: ${c}`}{`color: blue`}">c</div>
<div style="{a ? `color: ${c}` : ''} color: teal">d</div>
