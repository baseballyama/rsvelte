;
function $$render() {
  
	"use strict";
	let /** @typedef {{ a: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { a } = $props();
	let b = $state(0);
	$effect(() => { b = a; });

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      b;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ScriptDirectivePrologue__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ScriptDirectivePrologue__SvelteComponent_>} ScriptDirectivePrologue__SvelteComponent_ */
export default ScriptDirectivePrologue__SvelteComponent_;
