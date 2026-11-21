;
function $$render() {
  let show = $state(true);
;

  async () => {
    {
      svelteHTML.createElement("svelte:head", {});
      if (show) {
        {
          svelteHTML.createElement("title", {});
        }
        {
          svelteHTML.createElement("meta", {
            "name": "test",
            "content": "shown",
          });
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const HeadNested__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof HeadNested__SvelteComponent_>} HeadNested__SvelteComponent_ */
export default HeadNested__SvelteComponent_;
