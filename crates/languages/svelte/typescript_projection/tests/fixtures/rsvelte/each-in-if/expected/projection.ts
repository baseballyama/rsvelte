;

	/** @type {typeof __rsvelte_public_props0} */ let { show, list } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  show: __rsvelte_untyped_prop(),
  list: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  if (show) {
    {
      for (let [, entry] of __rsvelte_each(list)) {
        {
          svelteHTML.createElement("span", {});
          (entry);
        }
      }
    }
  } else {
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const EachInIf__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachInIf__SvelteComponent_>} */ (EachInIf__SvelteComponent_);
