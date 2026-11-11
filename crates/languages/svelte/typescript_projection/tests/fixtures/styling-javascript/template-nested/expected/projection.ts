;
const text=(`a${{value:`b${1}`}.value}`);
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": text,
    });
  }
};
const TemplateNested__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type TemplateNested__SvelteComponent_ = ReturnType<typeof TemplateNested__SvelteComponent_>;
export default TemplateNested__SvelteComponent_;
