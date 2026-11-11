;

	let choice = $state('b');
	let items = $state(['a', 'b']);

;

() => {
  {
    svelteHTML.createElement("select", {
      "bind:value": choice,
    });
    () => {
      // @ts-ignore
      choice = __rsvelte_untyped_prop();
    };
    {
      svelteHTML.createElement("option", {
        "value": "a",
      });
    }
    {
      svelteHTML.createElement("option", {
        "value": "b",
      });
    }
    {
      for (let [, item] of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("option", {});
          (item);
        }
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (choice);
  }
};
const SelectBind__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SelectBind__SvelteComponent_ = ReturnType<typeof SelectBind__SvelteComponent_>;
export default SelectBind__SvelteComponent_;
