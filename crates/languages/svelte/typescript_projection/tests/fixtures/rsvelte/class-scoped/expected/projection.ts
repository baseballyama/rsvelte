;

	let open = $state(false);
	let kind = $state('info');

;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": kind,
    });
  }
  {
    svelteHTML.createElement("p", {
      "class": `note ${kind}`,
    });
  }
  {
    svelteHTML.createElement("p", {});
    (open);
  }
  {
    svelteHTML.createElement("p", {
      "class": "static",
    });
    (open);
  }
  {
    svelteHTML.createElement("p", {
      "class": { open },
    });
  }
  {
    svelteHTML.createElement("p", {
      "class": 'fixed & sure',
    });
  }
  {
    svelteHTML.createElement("span", {
      "class": "plain",
    });
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => (open = !open),
    });
  }
};
const ClassScoped__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ClassScoped__SvelteComponent_>} */ (ClassScoped__SvelteComponent_);
