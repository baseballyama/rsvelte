;
let title = $state("A"); function value() { return title; }
;

async () => {
  {
    svelteHTML.createElement("svelte:head", {});
    {
      svelteHTML.createElement("title", {});
      (value());
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => title = "B",
    });
  }
};
const HeadMemo__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof HeadMemo__SvelteComponent_>} */ (HeadMemo__SvelteComponent_);
