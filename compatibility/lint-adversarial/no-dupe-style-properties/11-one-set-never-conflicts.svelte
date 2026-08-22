<script>
	let a = true;
	let b = false;
</script>

<div style={'color: red; color: blue'}>a</div>
<div style="{a ? 'color: red; color: blue' : ''}">b</div>
<div style="{a ? 'color: red' : 'color: blue'}">c</div>
<div style="{a ? 'color: red' : ''} {b ? 'color: blue' : ''}">d</div>
<div style="{a && 'color: red'}{b || 'color: blue'}">e</div>
<div style="{a ? 'color: red' : ''}; color: green">f</div>
