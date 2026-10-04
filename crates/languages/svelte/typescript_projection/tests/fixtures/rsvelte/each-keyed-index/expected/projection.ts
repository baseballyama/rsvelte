;

	let rows = $state([{ id: 'a' }, { id: 'b' }]);

;

() => {
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
export default __rsvelte_export_component<Record<string, never>, {}, "">();
