;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { items } = $props();
	let fallback = $state('n/a');

;

  const __rsvelte_public_props0 = __rsvelte_props({
    items: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      for (let [, item] of __rsvelte_each(items)) {
        const { width, height } = item.size;
        const [first, second = fallback] = item.tags;
        const { label: title, ...extra } = item;
        {
          svelteHTML.createElement("p", {});
          width;
          height;
          first;
          second;
          title;
          extra.note;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ConstDestructure__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ConstDestructure__SvelteComponent_>} ConstDestructure__SvelteComponent_ */
export default ConstDestructure__SvelteComponent_;
