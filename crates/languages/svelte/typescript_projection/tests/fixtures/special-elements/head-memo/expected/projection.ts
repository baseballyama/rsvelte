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
const HeadMemo__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type HeadMemo__SvelteComponent_ = ReturnType<typeof HeadMemo__SvelteComponent_>;
export default HeadMemo__SvelteComponent_;
