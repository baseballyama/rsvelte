;
function $$render() {
  let tag = $state("div"); let text = $state("Hello");
;

  async () => {
    {
      svelteHTML.createElement(tag, {
        "id": "example",
      });
      {
        svelteHTML.createElement("p", {});
        text;
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementChildren__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementChildren__SvelteComponent_>} ElementChildren__SvelteComponent_ */
export default ElementChildren__SvelteComponent_;
