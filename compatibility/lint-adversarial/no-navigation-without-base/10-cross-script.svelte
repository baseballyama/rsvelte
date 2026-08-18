<script module>
	import { replaceState } from '$app/navigation';
</script>

<script>
	function f() {
		replaceState('/cross', {});
	}
	void f;
</script>
<p>cross</p>
