<script>
	let s = 'a//b';
	let f = (x) => x;
</script>

<div data-x={`v${s.split(/\/\//)[0]}`}>1</div>
<div data-x={`v${f('//')}`}>2</div>
<div data-x={`v${f("/*")}`}>3</div>
