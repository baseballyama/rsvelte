;

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
const BindGroupDestructured__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindGroupDestructured__SvelteComponent_>} */ (BindGroupDestructured__SvelteComponent_);
