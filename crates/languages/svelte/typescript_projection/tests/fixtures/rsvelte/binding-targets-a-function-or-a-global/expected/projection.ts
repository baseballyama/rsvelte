;

	function a() {}
	class K {}

;

async () => {
  {
    svelteHTML.createElement("input", {
      "bind:value": a,
    });
    () => {
      // @ts-ignore
      a = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "bind:value": K,
    });
    () => {
      // @ts-ignore
      K = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "bind:value": foo .bar,
    });
    () => {
      // @ts-ignore
      foo .bar = __rsvelte_untyped_prop();
    };
  }
  {
    window.__el = svelteHTML.createElement("p", {});
  }
  (a);
};
const BindingTargetsAFunctionOrAGlobal__SvelteComponent_ = __rsvelte_export_component();
export default BindingTargetsAFunctionOrAGlobal__SvelteComponent_;
