<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	function nav1() {
		goto('/plain');
	}
	function nav2() {
		goto(base + '/ok');
	}
	function nav3() {
		goto(`${base}/ok`);
	}
	function nav4() {
		goto('https://example.com/ok');
	}
	function nav5() {
		goto('/user:42');
	}
	void [nav1, nav2, nav3, nav4, nav5];
</script>
<p>basic</p>
