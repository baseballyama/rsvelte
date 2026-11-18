<script>
	let b = 2;
</script>

<div data-x={`http://x${b}`}>1</div>
<div data-x={`a /* t */ ${b}`}>2</div>
<div data-x={`${b} // tail`}>3</div>
