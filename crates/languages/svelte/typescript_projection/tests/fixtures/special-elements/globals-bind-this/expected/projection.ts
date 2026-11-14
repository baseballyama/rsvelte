;
let win = $state(); let doc = $state(); let body = $state();
;

async () => {
  {
    win = svelteHTML.createElement("svelte:window", {});
  }
  {
    doc = svelteHTML.createElement("svelte:document", {});
  }
  {
    body = svelteHTML.createElement("svelte:body", {});
  }
};
const GlobalsBindThis__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof GlobalsBindThis__SvelteComponent_>} */ (GlobalsBindThis__SvelteComponent_);
