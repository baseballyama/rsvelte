;
const value="a";function run(x){switch(x){case 1:return "a";case 2:throw new Error("b");default:return "b";}}
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": run(1),
    });
  }
};
const Switch__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Switch__SvelteComponent_>} */ (Switch__SvelteComponent_);
