;
function $$render() {
  
	"use strict";
	let /** @type {typeof __rsvelte_public_props0} */ { a } = $props();
	let b = $state(0);
	$effect(() => { b = a; });

;

  const __rsvelte_public_props0 = __rsvelte_props({
    a: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("p", {});
      b;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ScriptDirectivePrologue__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ScriptDirectivePrologue__SvelteComponent_>} ScriptDirectivePrologue__SvelteComponent_ */
export default ScriptDirectivePrologue__SvelteComponent_;
