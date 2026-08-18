<script>
	let c = true;
</script>

<div style={c ? 'color: red' : ''}>1</div>
<div style={c ? '' : 'color: red'}>2</div>
<div style={c ? 'color: red' : 'top: 1px'}>3</div>
<div style={c ? '' : ''}>4</div>
<div style={c ? `color: red` : ''}>5</div>
