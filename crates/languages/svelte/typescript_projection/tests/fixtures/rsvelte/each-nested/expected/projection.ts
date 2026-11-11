;

	let groups = $state([
		{ name: 'fruit', items: ['apple', 'pear'] },
		{ name: 'veg', items: ['leek'] }
	]);

;

async () => {
  {
    for (let [, group] of __rsvelte_each(groups)) {
      {
        svelteHTML.createElement("h2", {});
        (group.name);
      }
      {
        svelteHTML.createElement("ul", {});
        {
          for (let [, item] of __rsvelte_each(group.items)) {
            {
              svelteHTML.createElement("li", {});
              (group.name);
              (item);
            }
          }
        }
      }
    }
  }
};
const EachNested__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EachNested__SvelteComponent_ = ReturnType<typeof EachNested__SvelteComponent_>;
export default EachNested__SvelteComponent_;
