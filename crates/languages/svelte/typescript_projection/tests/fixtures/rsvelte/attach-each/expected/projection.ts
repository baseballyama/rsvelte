;

	let items = $state([{ id: 1, label: 'a' }, { id: 2, label: 'b' }]);

	function highlight(item) {
		return (node) => {
			node.dataset.label = item.label;
		};
	}

;

async () => {
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
const AttachEach__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type AttachEach__SvelteComponent_ = ReturnType<typeof AttachEach__SvelteComponent_>;
export default AttachEach__SvelteComponent_;
