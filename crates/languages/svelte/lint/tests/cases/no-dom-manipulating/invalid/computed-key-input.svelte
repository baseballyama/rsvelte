<script>
	let el;
	function go() {
		el['rem' + 'ove']();
		el[`inner${'HTML'}`] = '';
		el[String('remove')]();
	}
</script>
<div bind:this={el}>a</div>
<button type="button" onclick={go}>x</button>
