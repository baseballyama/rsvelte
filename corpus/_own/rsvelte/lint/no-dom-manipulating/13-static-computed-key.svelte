<script>
	let el;

	function go() {
		el['remove']();
		el[`remove`]();
		el['rem' + 'ove']();
		el[`rem${''}ove`]();
		el['inner' + 'HTML'] = 'x';
		el[String('remove')]();
	}
</script>

<div bind:this={el}>a</div>
<button onclick={go}>x</button>
