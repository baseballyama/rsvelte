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
const ExportedConstState__SvelteComponent_ = __rsvelte_export_component();
export default ExportedConstState__SvelteComponent_;
