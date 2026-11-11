<script>
	let a = true;
</script>

<div style={'border-top-color: red; border: 0'}>a</div>
<div style="{a ? 'border-top-color: red; border: 0' : ''}">b</div>
<div style="{a ? 'border-top-color: red' : 'border: 0'}">c</div>
<div style="{a ? 'border-top-color: red' : ''}{a ? 'border: 0' : ''}">d</div>
<div style="{a ? 'border-top-color: red' : ''} border: 0">e</div>
<div style="border-top-color: red; {a ? 'border: 0' : ''}">f</div>
