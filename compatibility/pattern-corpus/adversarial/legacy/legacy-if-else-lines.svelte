<script>
	export let n = 0;
	let mood;
	$: if (n > 0) mood = 'up';
	else if (n < 0) mood = 'down';
	else mood = 'flat';
	$: for (let i = 0; i < n; i += 1) console.log(i);
	let spin = 0;
	$: while (spin < n) spin += 1;
	$: {
		// blocks may contain } and ) and ; in comments
		console.log(mood); /* } ) ; */
	}
</script>

<p>{mood} {spin}</p>
