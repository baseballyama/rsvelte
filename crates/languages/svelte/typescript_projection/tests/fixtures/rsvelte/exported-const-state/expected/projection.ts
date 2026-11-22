;
function $$render() {
  
	const o = $state({a: 1});
	const r = $state.raw([1]);
	function f() { o.a++; }

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": f,
      });
      o.a;
      r.length;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {
    o: typeof o;
    r: typeof r;
  }, "">} */ (__rsvelte_export_component))();
}
export const ExportedConstState__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ExportedConstState__SvelteComponent_>} ExportedConstState__SvelteComponent_ */
export default ExportedConstState__SvelteComponent_;
