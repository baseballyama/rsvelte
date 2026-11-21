;
function $$render() {
  
	let name = $state('world');

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:value": name,
      });
      () => {
        // @ts-ignore
        name = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("p", {});
      name;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindValue__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindValue__SvelteComponent_>} BindValue__SvelteComponent_ */
export default BindValue__SvelteComponent_;
