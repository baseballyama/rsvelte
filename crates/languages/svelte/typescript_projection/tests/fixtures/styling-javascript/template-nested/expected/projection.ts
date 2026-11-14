;
const text=(`a${{value:`b${1}`}.value}`);
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": text,
    });
  }
};
const TemplateNested__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof TemplateNested__SvelteComponent_>} */ (TemplateNested__SvelteComponent_);
