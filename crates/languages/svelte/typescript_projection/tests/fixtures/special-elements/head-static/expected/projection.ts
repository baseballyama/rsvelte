;
async () => {
  {
    svelteHTML.createElement("svelte:head", {});
    {
      svelteHTML.createElement("title", {});
    }
    {
      svelteHTML.createElement("meta", {
        "name": "description",
        "content": "test",
      });
    }
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const HeadStatic__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof HeadStatic__SvelteComponent_>} */ (HeadStatic__SvelteComponent_);
