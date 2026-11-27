;
function $$render() {
  let /** @typedef {{ tag: any, active: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { tag, active } = $props();
;

  async () => {
    {
      svelteHTML.createElement(tag, {
        "class": "base",
      });
      (active);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementClassDirective__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementClassDirective__SvelteComponent_>} ElementClassDirective__SvelteComponent_ */
export default ElementClassDirective__SvelteComponent_;
