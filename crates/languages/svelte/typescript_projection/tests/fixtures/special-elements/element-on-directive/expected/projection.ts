;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ {tag}= $props()
;

  const __rsvelte_public_props0 = __rsvelte_props({
    tag: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement(tag, {
        "on:click": ()=>{},
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementOnDirective__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementOnDirective__SvelteComponent_>} ElementOnDirective__SvelteComponent_ */
export default ElementOnDirective__SvelteComponent_;
