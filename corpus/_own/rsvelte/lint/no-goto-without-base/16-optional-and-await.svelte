<script>
	import { goto } from '$app/navigation';
	async function f() {
		goto?.('/optional-call');
		await goto('/awaited');
		void (goto('/sequenced'), 1);
	}
	void f;
</script>
<p>call forms</p>
