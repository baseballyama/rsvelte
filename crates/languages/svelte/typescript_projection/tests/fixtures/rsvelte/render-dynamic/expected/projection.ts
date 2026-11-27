;
function $$render() {
  let /** @typedef {{ header: any, footer: any, items: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { header, footer, items } = $props();
;

  async () => {
    __rsvelte_ensure_snippet(header());
    {
      svelteHTML.createElement("div", {});
      __rsvelte_ensure_snippet(footer?.(items));
    }
    {
      for (let item of __rsvelte_each(items)) {
        __rsvelte_ensure_snippet(item.view());
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const RenderDynamic__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RenderDynamic__SvelteComponent_>} RenderDynamic__SvelteComponent_ */
export default RenderDynamic__SvelteComponent_;
