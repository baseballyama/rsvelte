<script>
	let a = 1;
	let b = 2;
</script>

<div data-x={`v${b}`}>1</div>
<div data-x={`${a}${b}`}>2</div>
<div data-x={`static`}>3</div>
<div data-x={'s' + b}>4</div>
<div data-x="x{`v${b}`}y">5</div>
<div data-x={`v${b}`} data-y={`w${a}`}>6</div>
