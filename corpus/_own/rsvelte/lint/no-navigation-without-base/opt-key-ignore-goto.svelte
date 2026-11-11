<script>
	/* eslint svelte/no-navigation-without-base: ["warn",{"ignoreGoto":true}] */
	import { goto, pushState, replaceState } from '$app/navigation';
	function f() {
		goto('/g');
		pushState('/p', {});
		replaceState('/r', {});
	}
	void f;
</script>

<a href="/link">link</a>
