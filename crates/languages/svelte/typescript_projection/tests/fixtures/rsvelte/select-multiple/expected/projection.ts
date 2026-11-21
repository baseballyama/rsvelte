;
function $$render() {
  
	let flavours = $state(['mint']);
	const all = ['mint', 'lemon', 'cherry'];

;

  async () => {
    {
      svelteHTML.createElement("select", {
        "multiple": true,
        "bind:value": flavours,
      });
      () => {
        // @ts-ignore
        flavours = __rsvelte_untyped_prop();
      };
      {
        for (let [, flavour] of __rsvelte_each(all)) {
          {
            svelteHTML.createElement("option", {
              "value": flavour,
            });
            flavour;
          }
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
      flavours.join(', ');
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SelectMultiple__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SelectMultiple__SvelteComponent_>} SelectMultiple__SvelteComponent_ */
export default SelectMultiple__SvelteComponent_;
