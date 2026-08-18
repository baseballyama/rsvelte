<script>
	let x = 1;
	let foo = () => {};
</script>

<div style:color={`rgb(${x})`}>1</div>
<div use:foo={`p${x}`}>2</div>
<div class:on={`${x}`}>3</div>
