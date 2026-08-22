<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	const good = base + '/sub';
	function a() {
		goto(good);
	}
	let unassigned;
	function b() {
		unassigned = base + '/late';
		goto(unassigned);
	}
	function c(par) {
		goto(par);
	}
	const homeUrl = base + '/home';
	function shadow(homeUrl) {
		goto(homeUrl);
	}
	function two() {
		const u = '/plain';
		goto(u);
	}
	const u = base + '/first';
	function three() {
		goto(u);
	}
	void [a, b, c, shadow, two, three];
</script>
<p>vars</p>
