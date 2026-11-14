;

	let { results } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  results: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    for (let [, result] of __rsvelte_each(results)) {
      {
        svelteHTML.createElement("p", {});
        (result.title);
      }
    }
    {
      {
        svelteHTML.createElement("p", {});
      }
    }
  }
};
const EachElse__SvelteComponent_ = __rsvelte_export_component();
export default EachElse__SvelteComponent_;
