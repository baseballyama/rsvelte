;

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
        (result.title);
      }
    }
    {
      {
        svelteHTML.createElement("p", {});
      }
    }
  }
};
const EachElse__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachElse__SvelteComponent_>} */ (EachElse__SvelteComponent_);
