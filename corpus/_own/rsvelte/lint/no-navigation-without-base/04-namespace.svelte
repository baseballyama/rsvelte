<script>
	import * as nav from '$app/navigation';
	import { base } from '$app/paths';
	function a() {
		nav.goto(base + '/ok');
	}
	function b() {
		nav.pushState('/bad', {});
	}
	function c() {
		nav['replaceState']('/computed-bad', {});
	}
	void [a, b, c];
</script>
<a href={base + '/ok'}>ok</a>
