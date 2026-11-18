<script>
	/* eslint svelte/no-navigation-without-base: ["warn", { "ignoreLinks": true }] */
	import { goto } from '$app/navigation';
	function f() {
		goto('/still-bad');
	}
	void f;
</script>
<a href="/ignored-by-option">not flagged</a>
