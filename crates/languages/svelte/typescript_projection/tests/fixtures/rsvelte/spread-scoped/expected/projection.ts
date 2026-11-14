;

	let props = $props();
	let open = $state(false);

;

async () => {
  {
    svelteHTML.createElement("p", {
      ...(props),
    });
  }
  {
    svelteHTML.createElement("p", {
      ...(props),
      "class": "lead",
    });
  }
  {
    svelteHTML.createElement("p", {
      ...(props),
    });
    (open);
  }
  {
    svelteHTML.createElement("em", {
      ...(props),
    });
  }
  {
    svelteHTML.createElement("button", {
      "type": "button",
      "onclick": () => (open = !open),
    });
  }
};
const SpreadScoped__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<any, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SpreadScoped__SvelteComponent_>} */ (SpreadScoped__SvelteComponent_);
