;
let x = $state(1);
;

() => {
  {
    svelteHTML.createElement("select", {});
    {
      svelteHTML.createElement("option", {});
      {
        svelteHTML.createElement("span", {});
        (x);
      }
    }
    {
      svelteHTML.createElement("option", {
        "value": "b",
      });
      {
        svelteHTML.createElement("em", {});
      }
    }
  }
  {
    svelteHTML.createElement("select", {
      "bind:value": x,
    });
    () => {
      // @ts-ignore
      x = __rsvelte_untyped_prop();
    };
    {
      svelteHTML.createElement("optgroup", {
        "label": "G",
      });
      {
        svelteHTML.createElement("option", {});
        {
          svelteHTML.createElement("strong", {});
        }
      }
    }
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
