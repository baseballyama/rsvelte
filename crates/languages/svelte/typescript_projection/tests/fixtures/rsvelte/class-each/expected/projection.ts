;

	let selected = $state(1);
	let items = $state([
		{ id: 1, name: 'one', done: false },
		{ id: 2, name: 'two', done: true }
	]);

;

async () => {
  {
    svelteHTML.createElement("ul", {});
    {
      for (let [, item] of __rsvelte_each(items)) {
        (item.id);
        {
          svelteHTML.createElement("li", {
            "class": "row",
          });
          (item.id === selected);
          (item.done);
          {
            svelteHTML.createElement("button", {
              "class": { current: item.id === selected },
              "onclick": () => (selected = item.id),
            });
            (item.name);
          }
        }
      }
    }
  }
};
const ClassEach__SvelteComponent_ = __rsvelte_export_component();
export default ClassEach__SvelteComponent_;
