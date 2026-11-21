;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { results } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    results: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      for (let [, result] of __rsvelte_each(results)) {
        {
          svelteHTML.createElement("p", {});
          result.title;
        }
      }
      {
        {
          svelteHTML.createElement("p", {});
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const EachElse__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachElse__SvelteComponent_>} EachElse__SvelteComponent_ */
export default EachElse__SvelteComponent_;
