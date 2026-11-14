;
const items=Array.from({length:2},(_,i)=>({text:`a${i}`}));
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": items[0].text,
    });
  }
};
const TemplateObject__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof TemplateObject__SvelteComponent_>} */ (TemplateObject__SvelteComponent_);
