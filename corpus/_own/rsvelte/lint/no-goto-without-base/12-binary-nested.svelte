<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	function a() {
		goto(base + '/one' + '/two');
	}
	function b() {
		goto('/one' + base);
	}
	function c() {
		goto(base + '/ok');
	}
	function d() {
		goto(base - 1);
	}
	void [a, b, c, d];
</script>
<p>nested binary expressions</p>
