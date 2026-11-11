;
let title = $state("Hello");
;

() => {
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
const HeadState__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type HeadState__SvelteComponent_ = ReturnType<typeof HeadState__SvelteComponent_>;
export default HeadState__SvelteComponent_;
