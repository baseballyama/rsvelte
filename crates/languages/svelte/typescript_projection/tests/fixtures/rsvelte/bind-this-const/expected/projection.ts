;

	let items = $state([{ id: 1 }]);
	let els = $state({});
	let refs = $state([]);
	let n = $state(0);

;

() => {
  {
    for (let [i, item] of __rsvelte_each(items)) {
      const key = item.id;
      const k2 = key + n;
      {
        els[key] = svelteHTML.createElement("div", {});
      }
      {
        refs[k2][i] = svelteHTML.createElement("p", {});
      }
      if (n) {
        const inner = item.id;
        {
          els[inner] = svelteHTML.createElement("span", {});
        }
      }
    }
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
