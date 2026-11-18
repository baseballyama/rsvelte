<script>
	let color = $state('red');
	let bg = $state('white');
</script>

<div style:color style:background-color={bg} style:--accent={color} style:opacity|important={0.9}>
	a
</div>
<div style="margin: 0; --base: {bg}" style:color={color} style:margin-top="4px">b</div>
<div style="padding: {1 + 1}px {color === 'red' ? 2 : 3}px">c</div>
