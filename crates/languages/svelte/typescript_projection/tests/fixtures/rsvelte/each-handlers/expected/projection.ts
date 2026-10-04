;

	let items = $state(['one', 'two', 'three']);
	let picked = $state('');

	function remove(item) {
		items = items.filter((i) => i !== item);
	}

;

() => {
  {
    for (let [i, item] of __rsvelte_each(items)) {
      (item);
      {
        svelteHTML.createElement("button", {
          onclick: () => (picked = item),
        });
        (item);
      }
      {
        svelteHTML.createElement("button", {
          onclick: () => remove(item),
        });
        (i);
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (picked);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
