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
const TemplateDefault__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type TemplateDefault__SvelteComponent_ = ReturnType<typeof TemplateDefault__SvelteComponent_>;
export default TemplateDefault__SvelteComponent_;
