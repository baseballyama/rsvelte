<script>
	let a = true;
	let b = false;
</script>

<div class={a ? 'x' : b ? 'y' : ''}>1</div>
<div class={a ? (b ? 'x' : '') : ''}>2</div>
