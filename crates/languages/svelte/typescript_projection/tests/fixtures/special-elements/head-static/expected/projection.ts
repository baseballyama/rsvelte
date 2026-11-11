;
() => {
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
const HeadStatic__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type HeadStatic__SvelteComponent_ = ReturnType<typeof HeadStatic__SvelteComponent_>;
export default HeadStatic__SvelteComponent_;
