<script>
	let n = $state(1);
	const spread = { style: 'border: 0' };
</script>

<div style="color: red; --x: 1" style:color="blue" style:--x={n} style:margin="0" >a</div>
<div style="color: red" style:color={n > 0 ? 'blue' : null}>b</div>
<div style:width="{n}px" style:height="1px|important">c</div>
<div {...spread} style:color="red">d</div>
<div style="" style:color="red">e</div>
<div style={`color: ${n > 0 ? 'red' : 'blue'}`}>f</div>
