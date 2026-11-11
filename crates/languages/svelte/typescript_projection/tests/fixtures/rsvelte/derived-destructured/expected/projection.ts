;

	let { element, ...props }: typeof __rsvelte_public_props0 = $props();
	let o = $state({ a: 1, b: [1, 2], c: {} });
	let { a, b: [x, y = f()], ...rest } = $derived(o);
	let [p, q = 1, ...r] = $derived.by(() => [1, 2, 3]);
	let { k = 2, ['z']: z, 1: one } = $derived(o.c as any);
	let { title, $$slots: slots } = $derived(props);
	let cast = $derived(a as number);
	function f() { return 1; }

;

const __rsvelte_public_props0 = __rsvelte_props({
  element: __rsvelte_untyped_prop(),
}, {}, true);
() => {
  {
    svelteHTML.createElement("p", {});
    (a);
    (x);
    (y);
    (rest);
    (p);
    (q);
    (r);
    (k);
    (z);
    (one);
    (title);
    (slots);
    (cast);
    (element);
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
