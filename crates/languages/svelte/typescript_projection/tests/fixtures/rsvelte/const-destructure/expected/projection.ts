;
function $$render() {
  
	let /** @typedef {{ items: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { items } = $props();
	let fallback = $state('n/a');

;

  async () => {
    {
      for (let item of __rsvelte_each(items)) {
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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ConstDestructure__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ConstDestructure__SvelteComponent_>} ConstDestructure__SvelteComponent_ */
export default ConstDestructure__SvelteComponent_;
