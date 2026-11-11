;

	let { ...attrs }: typeof __rsvelte_public_props0 = $props();
	let text = $state('');
	let checked = $state(false);

;

const __rsvelte_public_props0 = __rsvelte_props({}, {}, true);
() => {
  {
    svelteHTML.createElement("input", {
      ...(attrs),
    });
  }
  {
    svelteHTML.createElement("input", {
      ...(attrs),
      "bind:value": text,
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      ...(attrs),
      "bind:checked": checked,
    });
    () => {
      // @ts-ignore
      checked = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      ...(attrs),
      "value": text,
      "defaultvalue": "seed",
    });
  }
  {
    svelteHTML.createElement("p", {});
    (text);
    (checked);
  }
};
const SpreadInput__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SpreadInput__SvelteComponent_ = ReturnType<typeof SpreadInput__SvelteComponent_>;
export default SpreadInput__SvelteComponent_;
