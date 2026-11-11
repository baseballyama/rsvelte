;

	let { items }: typeof __rsvelte_public_props0 = $props();
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
        (width);
        (height);
        (first);
        (second);
        (title);
        (extra.note);
      }
    }
  }
};
const ConstDestructure__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type ConstDestructure__SvelteComponent_ = ReturnType<typeof ConstDestructure__SvelteComponent_>;
export default ConstDestructure__SvelteComponent_;
