;

	"use strict";
	/** @type {typeof __rsvelte_public_props0} */ let { a } = $props();
	let b = $state(0);
	$effect(() => { b = a; });

;

const __rsvelte_public_props0 = __rsvelte_props({
  a: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("p", {});
    (b);
  }
};
const ScriptDirectivePrologue__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ScriptDirectivePrologue__SvelteComponent_>} */ (ScriptDirectivePrologue__SvelteComponent_);
