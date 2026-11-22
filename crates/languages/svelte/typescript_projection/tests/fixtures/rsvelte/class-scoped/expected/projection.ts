;
function $$render() {
  
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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ClassScoped__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ClassScoped__SvelteComponent_>} ClassScoped__SvelteComponent_ */
export default ClassScoped__SvelteComponent_;
