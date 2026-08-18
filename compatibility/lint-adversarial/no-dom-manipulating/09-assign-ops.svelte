<script>
	let el;

	function go() {
		el.innerHTML += '<b>a</b>';
		el.outerText ||= 'x';
		el.hidden = true;
		if (el.innerHTML === '') return;
	}
</script>

<div bind:this={el}>a</div>
<button on:click={go}>x</button>
