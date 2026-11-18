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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {
    o: typeof o;
    r: typeof r;
  }, "">} */ (__rsvelte_export_component))();
}
const ExportedConstState__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof ExportedConstState__SvelteComponent_>} */ (ExportedConstState__SvelteComponent_);
