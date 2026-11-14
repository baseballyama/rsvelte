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
const TemplateElement__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof TemplateElement__SvelteComponent_>} */ (TemplateElement__SvelteComponent_);
