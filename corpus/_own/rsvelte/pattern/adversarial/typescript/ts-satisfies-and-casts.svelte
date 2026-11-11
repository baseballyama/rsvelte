<script lang="ts">
	type Conf = { a: number; b?: string };
	let conf = $state({ a: 1 } satisfies Conf);
	let n = $derived(<number>(conf.a as unknown) + 1);
	let s = $derived((conf.b ?? 'x') as string);
	const arr = [1, 2, 3] as const;
	let first = $derived(arr[0] satisfies 1);
</script>

<p>{n}{s}{first}</p>
