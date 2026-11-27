;
function $$render() {
  
let /** @typedef {{ items: any, title?: string }} $$ComponentProps *//** @type {$$ComponentProps} */ {items,title='List'}=$props()
let total=$derived(items.length*2+1)

;

  async () => {
    {
      svelteHTML.createElement("section", {
        "class": "list",
        ...(__sveltets_2_empty({
          "data-count": total,
        })),
      });
      {
        svelteHTML.createElement("h2", {});
        title;
      }
      if (items.length>0) {
        {
          svelteHTML.createElement("p", {});
          total;
          items[0];
        }
      } else {
        {
          svelteHTML.createElement("p", {});
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const FormatCases__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof FormatCases__SvelteComponent_>} FormatCases__SvelteComponent_ */
export default FormatCases__SvelteComponent_;
