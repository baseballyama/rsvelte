;
function $$render() {
  let /** @typedef {{ status: any, error: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { status, error } = $props();
;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const HeadTemplateTitle__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof HeadTemplateTitle__SvelteComponent_>} HeadTemplateTitle__SvelteComponent_ */
export default HeadTemplateTitle__SvelteComponent_;
