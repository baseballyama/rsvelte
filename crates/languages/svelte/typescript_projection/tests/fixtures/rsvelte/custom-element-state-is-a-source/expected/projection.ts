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
const CustomElementStateIsASource__SvelteComponent_ = __rsvelte_export_component();
export default CustomElementStateIsASource__SvelteComponent_;
