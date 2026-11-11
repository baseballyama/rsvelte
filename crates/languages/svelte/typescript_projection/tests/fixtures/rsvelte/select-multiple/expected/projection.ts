;

	let flavours = $state(['mint']);
	const all = ['mint', 'lemon', 'cherry'];

;

() => {
  {
    svelteHTML.createElement("select", {
      "multiple": true,
      "bind:value": flavours,
    });
    () => {
      // @ts-ignore
      flavours = __rsvelte_untyped_prop();
    };
    {
      for (let [, flavour] of __rsvelte_each(all)) {
        {
          svelteHTML.createElement("option", {
            "value": flavour,
          });
          (flavour);
        }
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (flavours.join(', '));
  }
};
const SelectMultiple__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SelectMultiple__SvelteComponent_ = ReturnType<typeof SelectMultiple__SvelteComponent_>;
export default SelectMultiple__SvelteComponent_;
