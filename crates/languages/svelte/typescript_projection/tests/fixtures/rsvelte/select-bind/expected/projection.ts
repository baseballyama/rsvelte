;

	let choice = $state('b');
	let items = $state(['a', 'b']);

;

async () => {
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
const SelectBind__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SelectBind__SvelteComponent_>} */ (SelectBind__SvelteComponent_);
