<script lang="ts">
	import { onMount } from 'svelte';
	const before = 1;
	class K {
		m(a: number): number;
		m(a: any) { return a; }
	}
	const after = 2;
	const v = before + after + new K().m(1);
	void onMount;
</script>
<b>{v}</b>
