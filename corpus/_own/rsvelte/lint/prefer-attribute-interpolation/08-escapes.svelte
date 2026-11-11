<script>
	let b = 2;
</script>

<div data-x={`a\n${b}`}>1</div>
<div data-x={`a\\${b}`}>2</div>
<div data-x={`aA${b}`}>3</div>
<div data-x={`a\`${b}`}>4</div>
<div data-x={`a\${b}`}>5</div>
