;

	let groups = $state([
		{ name: 'fruit', items: ['apple', 'pear'] },
		{ name: 'veg', items: ['leek'] }
	]);

;

() => {
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
export default __rsvelte_export_component<Record<string, never>, {}, "">();
