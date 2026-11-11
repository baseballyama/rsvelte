<script>
	let rest = {};
	let el = null;
</script>

<div class="c" {...rest} id="i">1</div>
<div {...rest} class="c" id="i">2</div>
<div class="c" {...rest} bind:this={el}>3</div>
<div id="i" {...rest} title="t" alt="a">4</div>
