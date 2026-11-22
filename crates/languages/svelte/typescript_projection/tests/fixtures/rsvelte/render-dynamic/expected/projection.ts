;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ { header, footer, items } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    header: __rsvelte_untyped_prop(),
    footer: __rsvelte_untyped_prop(),
    items: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    __rsvelte_ensure_snippet(header());
    {
      svelteHTML.createElement("div", {});
      __rsvelte_ensure_snippet(footer?.(items));
    }
    {
      for (let [, item] of __rsvelte_each(items)) {
        __rsvelte_ensure_snippet(item.view());
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const RenderDynamic__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RenderDynamic__SvelteComponent_>} RenderDynamic__SvelteComponent_ */
export default RenderDynamic__SvelteComponent_;
