;

	let rows = $state([{ id: 'a' }, { id: 'b' }]);

;

async () => {
  {
    svelteHTML.createElement("div", {});
    {
      for (let [index, row] of __rsvelte_each(rows)) {
        (row.id);
        {
          svelteHTML.createElement("span", {});
          (index);
          (row.id);
        }
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const EachKeyedIndex__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachKeyedIndex__SvelteComponent_>} */ (EachKeyedIndex__SvelteComponent_);
