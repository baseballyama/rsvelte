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
const EachKeyedIndex__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EachKeyedIndex__SvelteComponent_ = ReturnType<typeof EachKeyedIndex__SvelteComponent_>;
export default EachKeyedIndex__SvelteComponent_;
