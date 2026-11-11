;

	let { focus = false, a = true }: typeof __rsvelte_public_props0 = $props();
	let s = $state(true);

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  focus: false,
  a: true,
}, false);
() => {
  {
    svelteHTML.createElement("input", {
      "autofocus": focus,
    });
  }
  {
    svelteHTML.createElement("input", {
      "autofocus": true,
    });
  }
  {
    svelteHTML.createElement("input", {
      "autofocus": true,
    });
  }
  {
    svelteHTML.createElement("textarea", {
      "autofocus": s,
    });
  }
  {
    svelteHTML.createElement("div", {});
    {
      svelteHTML.createElement("input", {
        "autofocus": a,
        "value": "x",
      });
    }
  }
  {
    svelteHTML.createElement("input", {
      ...({ a }),
      "autofocus": focus,
    });
  }
};
const AutofocusDynamic__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type AutofocusDynamic__SvelteComponent_ = ReturnType<typeof AutofocusDynamic__SvelteComponent_>;
export default AutofocusDynamic__SvelteComponent_;
