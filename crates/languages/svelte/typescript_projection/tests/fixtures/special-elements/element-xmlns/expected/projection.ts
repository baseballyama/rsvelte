;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let { ns, tag } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    ns: __rsvelte_untyped_prop(),
    tag: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement(tag, {
        "xmlns": ns,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementXmlns__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementXmlns__SvelteComponent_>} ElementXmlns__SvelteComponent_ */
export default ElementXmlns__SvelteComponent_;
