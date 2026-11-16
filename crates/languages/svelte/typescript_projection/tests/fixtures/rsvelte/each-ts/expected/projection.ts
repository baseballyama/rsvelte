;
type $$ComponentProps = { items: string[] };

;

function $$render() {
  
	let { items }: $$ComponentProps = $props();

;

  async () => {
    {
      for (let [, item] of __rsvelte_each(items)) {
        (item);
        {
          svelteHTML.createElement("p", {});
          item as string;
        }
      }
    }
  };
  return __rsvelte_export_component<$$ComponentProps, {}, "">();
}
const EachTs__SvelteComponent_ = $$render();
type EachTs__SvelteComponent_ = ReturnType<typeof EachTs__SvelteComponent_>;
export default EachTs__SvelteComponent_;
