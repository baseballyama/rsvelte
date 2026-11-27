;
function $$render() {
  let /** @typedef {{ tag: any, active: any }} $$ComponentProps *//** @type {$$ComponentProps} */ {tag, active} = $props();
;

  async () => {
    {
      svelteHTML.createElement(tag, {
        "class": "base",
      });
      (active());
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementClassMemo__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementClassMemo__SvelteComponent_>} ElementClassMemo__SvelteComponent_ */
export default ElementClassMemo__SvelteComponent_;
