<script>
	let a = '1px';
	let c = true;
</script>

<div style="color: {a}; {c ? 'top: 1px' : ''}">1</div>
<div style="{c ? 'left: 2px' : ''} color: red;">2</div>
