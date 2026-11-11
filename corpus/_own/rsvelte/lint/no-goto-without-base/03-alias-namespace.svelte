<script>
	import { goto as go } from '$app/navigation';
	import * as nav from '$app/navigation';
	import { base } from '$app/paths';
	function a() {
		go('/alias-bad');
	}
	function b() {
		nav.goto('/ns-bad');
	}
	function c() {
		nav['goto']('/computed-bad');
	}
	function d() {
		go(base + '/ok');
	}
	void [a, b, c, d];
</script>
<p>alias</p>
