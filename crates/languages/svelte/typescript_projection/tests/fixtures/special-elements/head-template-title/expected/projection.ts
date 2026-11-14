;
let { status, error }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  status: __rsvelte_untyped_prop(),
  error: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("svelte:head", {});
    {
      svelteHTML.createElement("title", {});
      (status);
      (error?.message);
    }
  }
};
const HeadTemplateTitle__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type HeadTemplateTitle__SvelteComponent_ = ReturnType<typeof HeadTemplateTitle__SvelteComponent_>;
export default HeadTemplateTitle__SvelteComponent_;
