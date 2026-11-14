;

	let names = $state(['Ada', 'Grace', 'Barbara']);

;

async () => {
  {
    svelteHTML.createElement("ul", {});
    {
      for (let [, name] of __rsvelte_each(names)) {
        {
          svelteHTML.createElement("li", {});
          (name);
        }
      }
    }
  }
};
const EachUnkeyed__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachUnkeyed__SvelteComponent_>} */ (EachUnkeyed__SvelteComponent_);
