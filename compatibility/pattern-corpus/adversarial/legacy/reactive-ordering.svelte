<script>
	export let seed = 1;

	$: quadrupled = doubled * 2;
	$: doubled = seed * 2;
	$: if (quadrupled > 8) {
		clamped = 8;
	} else {
		clamped = quadrupled;
	}
	let clamped;
	$: ({ lo, hi } = { lo: Math.min(doubled, clamped), hi: Math.max(doubled, clamped) });
	$: label = `${lo}..${hi}`;
	$: console.log(label);
</script>

<p>{label} {quadrupled} {doubled} {clamped}</p>
