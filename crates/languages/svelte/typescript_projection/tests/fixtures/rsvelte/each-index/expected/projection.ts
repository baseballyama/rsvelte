;

	let { items }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    svelteHTML.createElement("ol", {});
    {
      for (let [i, item] of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("li", {});
          (i + 1);
          (item);
        }
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (items.length);
  }
};
const EachIndex__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type EachIndex__SvelteComponent_ = ReturnType<typeof EachIndex__SvelteComponent_>;
export default EachIndex__SvelteComponent_;
