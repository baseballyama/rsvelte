;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { focus = false, a = true } = $props();
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
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const AutofocusDynamic__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof AutofocusDynamic__SvelteComponent_>} AutofocusDynamic__SvelteComponent_ */
export default AutofocusDynamic__SvelteComponent_;
