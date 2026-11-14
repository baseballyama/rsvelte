;
let title = $state("Hello");
;

async () => {
  {
    svelteHTML.createElement("svelte:head", {});
    {
      svelteHTML.createElement("title", {});
      (title);
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => title = "new",
    });
  }
};
const HeadState__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof HeadState__SvelteComponent_>} */ (HeadState__SvelteComponent_);
