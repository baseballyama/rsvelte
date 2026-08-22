<script lang="ts">
	import { goto } from '$app/navigation';
	const args: [string] = ['/x'];
	function f() {
		goto();
		goto(...args);
		goto(('/paren-bad'));
		goto('/cast-bad' as string);
	}
	void f;
</script>
<p>spread</p>
