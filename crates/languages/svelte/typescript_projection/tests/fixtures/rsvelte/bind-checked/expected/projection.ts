;
function $$render() {
  
	let agreed = $state(false);

;

  async () => {
    {
      svelteHTML.createElement("label", {});
      {
        svelteHTML.createElement("input", {
          "type": "checkbox",
          "bind:checked": agreed,
        });
        () => {
          // @ts-ignore
          agreed = __rsvelte_untyped_prop();
        };
      }
    }
    if (agreed) {
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindChecked__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindChecked__SvelteComponent_>} BindChecked__SvelteComponent_ */
export default BindChecked__SvelteComponent_;
