<script>
	let x = 'red';
</script>

<div style="content: '/*'; color: {x}">a</div>
<div style="content: '*/'; color: red">b</div>
<div style="content: 'a\\'; color: {x}">c</div>
<div style="content: 'unterminated; color: {x}">d</div>
<div style="background: url({x}.png); color: red">e</div>
<div style="background: url('{x}.png'); color: red">f</div>
