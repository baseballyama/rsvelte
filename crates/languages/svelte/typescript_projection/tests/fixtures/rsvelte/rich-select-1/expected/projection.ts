;
let x = $state(1);
;

async () => {
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
const RichSelect1__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof RichSelect1__SvelteComponent_>} */ (RichSelect1__SvelteComponent_);
