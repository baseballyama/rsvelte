;
function $$render() {
  
	const array = [1, 2, 3, [4]];
	const [a, b, c, [d]] = array;
	const { p, q: r, ...s } = { p: 1, q: 2 };
	class Foo {}
	let x = $state(1);

;

  async () => {
    x;
    a;
    {
      svelteHTML.createElement("button", {
        "onclick": () => x++,
      });
      p;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {
    a: typeof a;
    b: typeof b;
    c: typeof c;
    d: typeof d;
    p: typeof p;
    r: typeof r;
    s: typeof s;
    Foo: typeof Foo;
  }, "">} */ (__rsvelte_export_component))();
}
export const ExportDeclarations__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ExportDeclarations__SvelteComponent_>} ExportDeclarations__SvelteComponent_ */
export default ExportDeclarations__SvelteComponent_;
