<script context="module">
	import { writable, derived } from 'svelte/store';

	export const shared = writable({ n: 0, list: [] });
</script>

<script>
	const local = writable(0);
	const combo = derived([shared, local], ([$s, $l]) => $s.n + $l);

	function bump() {
		$local += 1;
		$shared.n = $local;
		$shared.list[$local] = 'x';
		$shared = $shared;
	}
</script>

<button onclick={bump}>{$combo} / {$shared.list.length} / {$local}</button>
