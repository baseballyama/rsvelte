;

	let { options = [], ...rest }: typeof __rsvelte_public_props0 = $props();
	let current = $state('x');

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  options: __rsvelte_empty_array([]),
}, true);
() => {
  {
    svelteHTML.createElement("select", {
      ...(rest),
      "class": "picker",
      "bind:value": current,
    });
    () => {
      // @ts-ignore
      current = __rsvelte_untyped_prop();
    };
    {
      for (let [, option] of __rsvelte_each(options)) {
        {
          svelteHTML.createElement("option", {
            "value": option,
          });
          (option === current);
          (option);
        }
      }
    }
    {
      svelteHTML.createElement("optgroup", {
        "label": "more",
      });
      {
        svelteHTML.createElement("option", {
          ...(rest),
        });
      }
    }
  }
};
const SelectSpread__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SelectSpread__SvelteComponent_ = ReturnType<typeof SelectSpread__SvelteComponent_>;
export default SelectSpread__SvelteComponent_;
