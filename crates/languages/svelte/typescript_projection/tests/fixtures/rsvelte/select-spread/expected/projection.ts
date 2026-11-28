;
function $$render() {
  
	let /** @typedef {{ options?: any[] } & Record<string, any>} $$ComponentProps *//** @type {$$ComponentProps} */ { options = [], ...rest } = $props();
	let current = $state('x');

;

  async () => {
    {
      svelteHTML.createElement("select", {
        ...(rest),
        "class": "picker",
        "bind:value": current,
      });
      () => {
        // @ts-ignore
        current = __rsvelte_untyped_prop();
      };
      {
        for (let option of __rsvelte_each(options)) {
          {
            svelteHTML.createElement("option", {
              "value": option,
            });
            (option === current);
            option;
          }
        }
      }
      {
        svelteHTML.createElement("optgroup", {
          "label": "more",
        });
        {
          svelteHTML.createElement("option", {
            ...(rest),
          });
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SelectSpread__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SelectSpread__SvelteComponent_>} SelectSpread__SvelteComponent_ */
export default SelectSpread__SvelteComponent_;
