;
function $$render() {
  
	let v = $state(false);

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": "radio",
        "bind:checked": v,
      });
      () => {
        // @ts-ignore
        v = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindCheckedOnARadio__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindCheckedOnARadio__SvelteComponent_>} BindCheckedOnARadio__SvelteComponent_ */
export default BindCheckedOnARadio__SvelteComponent_;
