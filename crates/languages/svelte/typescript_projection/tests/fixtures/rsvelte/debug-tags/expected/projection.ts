;
let x = $state(1); let y = 2; let o = $state({a: 1});
;

async () => {
  {
    (x);
    (y);
  }
  {
  }
  if (x) {
    {
      (o);
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => x++,
    });
    (x);
  }
};
const DebugTags__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DebugTags__SvelteComponent_>} */ (DebugTags__SvelteComponent_);
