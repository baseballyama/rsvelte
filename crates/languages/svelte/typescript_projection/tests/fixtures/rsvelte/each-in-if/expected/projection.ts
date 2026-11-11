;

	let { show, list }: typeof __rsvelte_public_props0 = $props();

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
const EachInIf__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type EachInIf__SvelteComponent_ = ReturnType<typeof EachInIf__SvelteComponent_>;
export default EachInIf__SvelteComponent_;
