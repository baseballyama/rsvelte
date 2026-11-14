;
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
const HeadNested__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof HeadNested__SvelteComponent_>} */ (HeadNested__SvelteComponent_);
