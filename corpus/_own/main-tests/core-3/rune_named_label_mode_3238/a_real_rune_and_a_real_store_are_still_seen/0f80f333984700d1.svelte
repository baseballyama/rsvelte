<script>
	import { writable } from 'svelte/store';
	const state = writable(0);
	function f() {
		$state: for (;;) { break $state; }
	}
</script>

<div>{$state} {f}</div>
