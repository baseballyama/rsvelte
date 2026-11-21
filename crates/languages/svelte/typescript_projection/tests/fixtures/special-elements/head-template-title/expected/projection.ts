;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let { status, error } = $props();
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
        status;
        error?.message;
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const HeadTemplateTitle__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof HeadTemplateTitle__SvelteComponent_>} HeadTemplateTitle__SvelteComponent_ */
export default HeadTemplateTitle__SvelteComponent_;
