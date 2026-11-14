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
const EachKeyedIndex__SvelteComponent_ = __rsvelte_export_component();
export default EachKeyedIndex__SvelteComponent_;
