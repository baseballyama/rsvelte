<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	const q = '?q=1';
	const obj = { base };
	function a() {
		goto(`${base}${q}/ok`);
	}
	function b() {
		goto(`/pre${base}/bad`);
	}
	function c() {
		goto(`${obj.base}/bad-member-start`);
	}
	function d() {
		goto(``);
	}
	void [a, b, c, d];
</script>
<p>tpl</p>
