<script>
	let b = 2;
</script>

<div data-a={`a\t${b}`}>1</div>
<div data-b={`a\v${b}`}>2</div>
<div data-c={`a\f${b}`}>3</div>
<div data-d={`a\b${b}`}>4</div>
<div data-e={`aA${b}`}>5</div>
<div data-f={`a\x41${b}`}>6</div>
<div data-g={`a\r${b}`}>7</div>
