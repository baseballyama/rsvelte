<script>
	let a = true;
</script>

<div style:margin="0" style="margin: 1px; margin-top: 2px" style:margin-top="3px">a</div>
<div style="{a ? 'color: red' : ''}" style:color="blue">b</div>
<div style:color="blue" style="{a ? 'color: red' : ''}">c</div>
