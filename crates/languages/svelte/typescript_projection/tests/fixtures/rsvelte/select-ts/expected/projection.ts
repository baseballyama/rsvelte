;

	let size: number = $state(1);
	let name: string = $state('a');

;

async () => {
  {
    svelteHTML.createElement("select", {
      "value": size,
      "onchange": (e) => (size = e.currentTarget.selectedIndex),
    });
    {
      svelteHTML.createElement("option", {
        "value": 1,
      });
    }
    {
      svelteHTML.createElement("option", {
        "value": 2,
      });
    }
  }
  {
    svelteHTML.createElement("select", {
      "value": name.toFixed(1),
    });
    {
      svelteHTML.createElement("option", {});
      (name);
    }
  }
};
const SelectTs__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SelectTs__SvelteComponent_ = ReturnType<typeof SelectTs__SvelteComponent_>;
export default SelectTs__SvelteComponent_;
