;
let win = $state(); let n = $state(0);
;

async () => {
  {
    win = svelteHTML.createElement("svelte:window", {
      "onclick": () => n++,
    });
  }
  {
    svelteHTML.createElement("p", {});
    (n);
  }
};
const GlobalsBindThisMixed__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof GlobalsBindThisMixed__SvelteComponent_>} */ (GlobalsBindThisMixed__SvelteComponent_);
