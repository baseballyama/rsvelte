;

	let { ...attrs } = $props();
	let text = $state('');
	let checked = $state(false);

;

const __rsvelte_public_props0 = __rsvelte_props({}, {}, true);
async () => {
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
const SpreadInput__SvelteComponent_ = __rsvelte_export_component();
export default SpreadInput__SvelteComponent_;
