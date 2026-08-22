<script>
	import { goto } from '$app/navigation';
	import { base, assets } from '$app/paths';
	function a() {
		goto(assets + '/assets-is-not-base');
	}
	function b() {
		goto(base + '/ok');
	}
	function c() {
		goto(`${assets}/assets-template`);
	}
	void [a, b, c];
</script>
<p>only base counts as the base path</p>
