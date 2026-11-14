;

	const o = $state({a: 1});
	const r = $state.raw([1]);
	function f() { o.a++; }

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": f,
    });
    (o.a);
    (r.length);
  }
};
const ExportedConstState__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {
  o: typeof o;
  r: typeof r;
}, "">();
type ExportedConstState__SvelteComponent_ = ReturnType<typeof ExportedConstState__SvelteComponent_>;
export default ExportedConstState__SvelteComponent_;
