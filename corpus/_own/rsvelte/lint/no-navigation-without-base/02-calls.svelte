<script>
	import { goto, pushState, replaceState } from '$app/navigation';
	import { base } from '$app/paths';
	const st = {};
	function a() {
		goto(base);
	}
	function b() {
		goto('/bad');
	}
	function c() {
		goto('https://external.example/absolute-still-bad-here');
	}
	function d() {
		pushState('', st);
		replaceState('', st);
	}
	function e() {
		pushState('/bad-push', st);
		replaceState('/bad-replace', st);
	}
	void [a, b, c, d, e];
</script>
<p>calls</p>
