;
let x = $state(1);
;

async () => {
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
const TemplateElement__SvelteComponent_ = __rsvelte_export_component();
export default TemplateElement__SvelteComponent_;
