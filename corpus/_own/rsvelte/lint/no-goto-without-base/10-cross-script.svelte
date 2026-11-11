<script module>
	import { goto } from '$app/navigation';
</script>

<script>
	function f() {
		goto('/cross-script-bad');
	}
	void f;
</script>
<p>cross</p>
