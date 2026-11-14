;

	let { focus = false, a = true } = $props();
	let s = $state(true);

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  focus: false,
  a: true,
}, false);
async () => {
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
const AutofocusDynamic__SvelteComponent_ = __rsvelte_export_component();
export default AutofocusDynamic__SvelteComponent_;
