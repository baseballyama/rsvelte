;

	let items = $state([{ id: 1, label: 'a' }, { id: 2, label: 'b' }]);

	function highlight(item) {
		return (node) => {
			node.dataset.label = item.label;
		};
	}

;

() => {
  {
    svelteHTML.createElement("ul", {});
    {
      for (let [, item] of __rsvelte_each(items)) {
        (item.id);
        {
          svelteHTML.createElement("li", {
            [Symbol("@attach")]: highlight(item),
          });
          (item.label);
        }
      }
    }
  }
  if (items.length > 1) {
    {
      svelteHTML.createElement("section", {});
      {
        svelteHTML.createElement("h2", {
          [Symbol("@attach")]: highlight(items[0]),
        });
      }
    }
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
