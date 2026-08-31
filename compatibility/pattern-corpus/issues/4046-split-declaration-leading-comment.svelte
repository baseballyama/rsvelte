<!-- Five comments on purpose: a reverse scan that stops at the first
     non-matching entry meets the LATER ones first and aborts, which every
     single-comment probe passes. -->
<script>
	let single = 1;

	// own line
	let a = 1, b = 2;

	/* block */
	let c = 3, d = 4;

	// first
	// second
	let e = 5, f = 6;

	let g = 7; // trailing
	let h = 8, i = 9;

	// not split
	let j = 10;
</script>

<p>{single}{a}{b}{c}{d}{e}{f}{g}{h}{i}{j}</p>
