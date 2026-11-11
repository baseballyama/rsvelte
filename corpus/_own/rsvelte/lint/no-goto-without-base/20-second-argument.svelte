<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	function f() {
		goto(base + '/ok', { replaceState: true });
		goto('/bad', { replaceState: true, noScroll: true });
	}
	void f;
</script>
<p>options object is ignored by the rule</p>
