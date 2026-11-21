;
function $$render() {
  let tag = $state("div"); let attrs = $state({ id: "test" });
;

  async () => {
    {
      svelteHTML.createElement(tag, {
        ...(attrs),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementSpread__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementSpread__SvelteComponent_>} ElementSpread__SvelteComponent_ */
export default ElementSpread__SvelteComponent_;
