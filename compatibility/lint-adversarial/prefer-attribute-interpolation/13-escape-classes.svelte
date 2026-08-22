<script>
	let b = 2;
</script>

<div data-a={`a\0${b}`}>1</div>
<div data-b={`a\'${b}`}>2</div>
<div data-c={`a\"${b}`}>3</div>
<div data-d={`a\q${b}`}>4</div>
<div data-e={`a\$${b}`}>5</div>
