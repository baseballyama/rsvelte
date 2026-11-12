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
const SpreadScoped__SvelteComponent_ = __rsvelte_export_component<any, {}, "">();
type SpreadScoped__SvelteComponent_ = ReturnType<typeof SpreadScoped__SvelteComponent_>;
export default SpreadScoped__SvelteComponent_;
