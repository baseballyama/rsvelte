;
function $$render() {
  
	let list = $state([{ id: 1, data: [{ data: [] }] }]);

;

  async () => {
    {
      for (let [, { id, data }] of __rsvelte_each(list)) {
        {
          for (let [, item] of __rsvelte_each(data)) {
            {
              svelteHTML.createElement("input", {
                "type": "checkbox",
                "value": id,
              });
              item.data = __rsvelte_untyped_prop();
            }
          }
        }
        const picks = data[0];
        {
          svelteHTML.createElement("input", {
            "type": "checkbox",
            "value": id,
          });
          picks.data = __rsvelte_untyped_prop();
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindGroupDestructured__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindGroupDestructured__SvelteComponent_>} BindGroupDestructured__SvelteComponent_ */
export default BindGroupDestructured__SvelteComponent_;
