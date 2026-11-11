<script>
	let a = $state(1);
	let v1 = $derived.by(() => {
		'use strict';
		return a;
	});
	let v2 = $derived.by(() => {});
	let v3 = $derived.by(() => {
		return null;
	});
	let v4 = $derived.by(() => {
		if (a) return 1;
	});
</script>

{v1}{v2}{v3}{v4}
