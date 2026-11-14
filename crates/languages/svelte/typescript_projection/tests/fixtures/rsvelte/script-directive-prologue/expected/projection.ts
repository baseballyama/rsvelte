;

	"use strict";
	let { a } = $props();
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
const ScriptDirectivePrologue__SvelteComponent_ = __rsvelte_export_component();
export default ScriptDirectivePrologue__SvelteComponent_;
