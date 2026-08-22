<script lang="ts">
	import { 'goto' as g } from '$app/navigation';
	function f() {
		g('/string-imported-bad');
	}
	void f;
</script>
<p>string import</p>
