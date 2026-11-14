;

	let n = $state(1);
	let d = $derived(2);

;

async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": "my-el",
    });
  }
  {
    svelteHTML.createElement("p", {});
    (n);
  }
  {
    svelteHTML.createElement("p", {
      "title": d,
    });
  }
};
const CustomElementStateIsASource__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type CustomElementStateIsASource__SvelteComponent_ = ReturnType<typeof CustomElementStateIsASource__SvelteComponent_>;
export default CustomElementStateIsASource__SvelteComponent_;
