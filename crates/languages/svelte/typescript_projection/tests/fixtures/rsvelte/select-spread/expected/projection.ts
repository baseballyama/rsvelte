;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { options = [], ...rest } = $props();
	let current = $state('x');

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    options: __rsvelte_array_prop(),
  }, true);
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
        for (let [, option] of __rsvelte_each(options)) {
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
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const SelectSpread__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SelectSpread__SvelteComponent_>} SelectSpread__SvelteComponent_ */
export default SelectSpread__SvelteComponent_;
