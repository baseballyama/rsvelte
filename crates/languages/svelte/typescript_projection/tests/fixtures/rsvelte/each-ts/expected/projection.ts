;

	let { items }: { items: string[] } = $props();

;

async () => {
  {
    for (let [, item] of __rsvelte_each(items)) {
      (item);
      {
        svelteHTML.createElement("p", {});
        (item as string);
      }
    }
  }
};
const EachTs__SvelteComponent_ = __rsvelte_export_component<{ items: string[] }, {}, "">();
type EachTs__SvelteComponent_ = ReturnType<typeof EachTs__SvelteComponent_>;
export default EachTs__SvelteComponent_;
