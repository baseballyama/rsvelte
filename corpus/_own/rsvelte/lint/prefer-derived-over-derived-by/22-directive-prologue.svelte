<script>
	let a = $state(1);
	let d1 = $derived.by(() => {
		'use strict';
		return a;
	});
	let d2 = $derived.by(function () {
		"use asm";
		return a;
	});
	let d3 = $derived.by(() => {
		/* only a comment */
		return a;
	});
	let d4 = $derived.by(() => {
		// only a comment
		return a;
	});
</script>

{d1}{d2}{d3}{d4}
