;

	let { p = 1 }: typeof __rsvelte_public_props0 = $props();
	let a = 1;
	let s = $state(0);
	let f = () => 1;
	class K {}
	let _class = '';
	export { a, s, p, f, K, _class as class };

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  p: 1,
}, false);
() => {
  {
    svelteHTML.createElement("div", {
      "class": _class,
      "onclick": f,
    });
    (a);
    (s);
    (p);
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
