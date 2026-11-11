<script>
	import { pushState, replaceState } from '$app/navigation';
	const tuple = ['/x', {}];
	function f() {
		replaceState(...tuple);
	}
	function g() {
		pushState();
	}
	void [f, g];
</script>
<p>spread</p>
