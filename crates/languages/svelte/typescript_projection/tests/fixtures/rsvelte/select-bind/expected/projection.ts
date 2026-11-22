;
function $$render() {
  
	let choice = $state('b');
	let items = $state(['a', 'b']);

;

  async () => {
    {
      svelteHTML.createElement("select", {
        "bind:value": choice,
      });
      () => {
        // @ts-ignore
        choice = __rsvelte_untyped_prop();
      };
      {
        svelteHTML.createElement("option", {
          "value": "a",
        });
      }
      {
        svelteHTML.createElement("option", {
          "value": "b",
        });
      }
      {
        for (let [, item] of __rsvelte_each(items)) {
          {
            svelteHTML.createElement("option", {});
            item;
          }
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
      choice;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SelectBind__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SelectBind__SvelteComponent_>} SelectBind__SvelteComponent_ */
export default SelectBind__SvelteComponent_;
