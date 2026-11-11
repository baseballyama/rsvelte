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
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
