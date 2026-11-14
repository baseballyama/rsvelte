;
const f=(x=`a${1}`)=>x;
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": f(),
    });
  }
};
const TemplateDefault__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof TemplateDefault__SvelteComponent_>} */ (TemplateDefault__SvelteComponent_);
