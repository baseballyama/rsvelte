<script>
	import { goto } from '$app/navigation';
	const s = "goto('/fake-in-string')";
	const t = `goto('/fake-in-template') ${'goto("/x")'}`;
	const r = /goto\('\/fake-in-regex'\)/;
	// goto('/fake-in-line-comment')
	/* goto('/fake-in-block-comment') */
	function go() {
		goto('/real-after-decoys');
	}
	void [s, t, r, go];
</script>
<p>decoys</p>
