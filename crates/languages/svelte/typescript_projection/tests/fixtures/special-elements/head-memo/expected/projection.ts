;
function $$render() {
  let title = $state("A"); function value() { return title; }
;

  async () => {
    {
      svelteHTML.createElement("svelte:head", {});
      {
        svelteHTML.createElement("title", {});
        value();
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => title = "B",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const HeadMemo__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof HeadMemo__SvelteComponent_>} HeadMemo__SvelteComponent_ */
export default HeadMemo__SvelteComponent_;
