;
function $$render() {
  let title = $state("Hello");
;

  async () => {
    {
      svelteHTML.createElement("svelte:head", {});
      {
        svelteHTML.createElement("title", {});
        title;
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => title = "new",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const HeadState__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof HeadState__SvelteComponent_>} HeadState__SvelteComponent_ */
export default HeadState__SvelteComponent_;
