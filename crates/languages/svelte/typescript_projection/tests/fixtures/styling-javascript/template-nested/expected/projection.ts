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
const TemplateNested__SvelteComponent_ = __rsvelte_export_component();
export default TemplateNested__SvelteComponent_;
