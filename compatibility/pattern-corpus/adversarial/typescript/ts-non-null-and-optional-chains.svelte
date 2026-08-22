<script lang="ts">
	let obj = $state<{ deep?: { list?: number[] } } | null>({ deep: { list: [1] } });
	let v = $derived(obj!.deep?.list?.[0]! + 1);
	let f = $state<(() => number) | undefined>(undefined);
	let r = $derived(f?.() ?? 0);
</script>

<p>{v}{r}</p>
<button onclick={() => (obj!.deep!.list![0] += 1)}>+</button>
