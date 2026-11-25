;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { value, items } = $props();

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
        for (let item of __rsvelte_each(items)) {
          {
            svelteHTML.createElement("option", {
              "value": item,
            });
            {
              svelteHTML.createElement("span", {});
              item;
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
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const Selectedcontent__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Selectedcontent__SvelteComponent_>} Selectedcontent__SvelteComponent_ */
export default Selectedcontent__SvelteComponent_;
