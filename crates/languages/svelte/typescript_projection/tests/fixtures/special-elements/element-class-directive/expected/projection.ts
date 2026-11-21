;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ { tag, active } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    tag: __rsvelte_untyped_prop(),
    active: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement(tag, {
        "class": "base",
      });
      (active);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementClassDirective__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementClassDirective__SvelteComponent_>} ElementClassDirective__SvelteComponent_ */
export default ElementClassDirective__SvelteComponent_;
