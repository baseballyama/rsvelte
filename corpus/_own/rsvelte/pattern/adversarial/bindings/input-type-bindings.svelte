<script>
	let num = $state(0);
	let range = $state(50);
	let date = $state('2026-01-01');
	let time = $state('12:00');
	let clr = $state('#000000');
</script>

<input type="number" bind:value={num} min="0" max="10" step="0.5" />
<input type="range" bind:value={range} />
<input type="date" bind:value={date} />
<input type="time" bind:value={time} />
<input type="color" bind:value={clr} />
<p>{num + range}:{date}:{time}:{clr}</p>
