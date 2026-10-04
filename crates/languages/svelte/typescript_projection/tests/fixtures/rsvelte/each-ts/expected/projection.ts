;

	let { items }: { items: string[] } = $props();

;

() => {
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
export default __rsvelte_export_component<{ items: string[] }, {}, "">();
