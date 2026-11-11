;
let x = $state(1);
;

() => {
  {
    svelteHTML.createElement("template", {
      "id": "t",
    });
    {
      svelteHTML.createElement("b", {});
    }
    (x);
  }
  {
    svelteHTML.createElement("template", {});
    {
      svelteHTML.createElement("b", {});
      (x);
    }
  }
  {
    svelteHTML.createElement("div", {});
    {
      svelteHTML.createElement("template", {});
      {
        svelteHTML.createElement("i", {});
      }
    }
  }
};
const TemplateElement__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type TemplateElement__SvelteComponent_ = ReturnType<typeof TemplateElement__SvelteComponent_>;
export default TemplateElement__SvelteComponent_;
