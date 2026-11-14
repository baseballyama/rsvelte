;

	const array = [1, 2, 3, [4]];
	const [a, b, c, [d]] = array;
	const { p, q: r, ...s } = { p: 1, q: 2 };
	class Foo {}
	let x = $state(1);

;

async () => {
  (x);
  (a);
  {
    svelteHTML.createElement("button", {
      "onclick": () => x++,
    });
    (p);
  }
};
const ExportDeclarations__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {
  a: typeof a;
  b: typeof b;
  c: typeof c;
  d: typeof d;
  p: typeof p;
  r: typeof r;
  s: typeof s;
  Foo: typeof Foo;
}, "">();
type ExportDeclarations__SvelteComponent_ = ReturnType<typeof ExportDeclarations__SvelteComponent_>;
export default ExportDeclarations__SvelteComponent_;
