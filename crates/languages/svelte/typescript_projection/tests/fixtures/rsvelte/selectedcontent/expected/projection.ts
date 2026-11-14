;

	/** @type {typeof __rsvelte_public_props0} */ let { value, items } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  value: __rsvelte_untyped_prop(),
  items: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("select", {
      "bind:value": value,
    });
    () => {
      // @ts-ignore
      value = __rsvelte_untyped_prop();
    };
    {
      svelteHTML.createElement("button", {
        "dir": "auto",
      });
      {
        svelteHTML.createElement("selectedcontent", {});
      }
    }
    {
      for (let [, item] of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("option", {
            "value": item,
          });
          {
            svelteHTML.createElement("span", {});
            (item);
          }
        }
      }
    }
  }
  {
    svelteHTML.createElement("select", {});
    {
      svelteHTML.createElement("button", {});
      {
        svelteHTML.createElement("b", {});
      }
      {
        svelteHTML.createElement("selectedcontent", {});
      }
    }
    {
      svelteHTML.createElement("option", {});
    }
  }
};
const Selectedcontent__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Selectedcontent__SvelteComponent_>} */ (Selectedcontent__SvelteComponent_);
