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
const TemplateDefault__SvelteComponent_ = __rsvelte_export_component();
export default TemplateDefault__SvelteComponent_;
