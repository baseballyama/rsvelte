<script>
	let foo = () => {};
	let bar = () => {};
	let a = 1;
	let b = 2;
</script>

<div use:foo use:foo>1</div>
<div use:foo={a} use:foo={b}>2</div>
<div use:foo={a} use:foo={a}>3</div>
<div use:foo use:bar>4</div>
<div use:foo use:foo={foo}>5</div>
