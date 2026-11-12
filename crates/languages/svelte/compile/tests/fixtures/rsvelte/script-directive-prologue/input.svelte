<script>
	"use strict";
	let { a } = $props();
	let b = $state(0);
	$effect(() => { b = a; });
</script>
<p>{b}</p>
