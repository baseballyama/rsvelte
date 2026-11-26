;
function $$render() {
  
	let items = $state(['one', 'two', 'three']);
	let picked = $state('');

	function remove(item) {
		items = items.filter((i) => i !== item);
	}

;

  async () => {
    {
      for (let item of __rsvelte_each(items)) {
        let i = 1;
        (item);
        {
          svelteHTML.createElement("button", {
            "onclick": () => (picked = item),
          });
          item;
        }
        {
          svelteHTML.createElement("button", {
            "onclick": () => remove(item),
          });
          i;
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
      picked;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EachHandlers__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachHandlers__SvelteComponent_>} EachHandlers__SvelteComponent_ */
export default EachHandlers__SvelteComponent_;
