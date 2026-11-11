<script lang="ts">
	let { element, ...props } = $props();
	let o = $state({ a: 1, b: [1, 2], c: {} });
	let { a, b: [x, y = f()], ...rest } = $derived(o);
	let [p, q = 1, ...r] = $derived.by(() => [1, 2, 3]);
	let { k = 2, ['z']: z, 1: one } = $derived(o.c as any);
	let { title, $$slots: slots } = $derived(props);
	let cast = $derived(a as number);
	function f() { return 1; }
</script>
<p>{a} {x} {y} {rest} {p} {q} {r} {k} {z} {one} {title} {slots} {cast} {element}</p>
