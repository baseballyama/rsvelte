;

	let names = $state(['Ada', 'Grace', 'Barbara']);

;

() => {
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
const EachUnkeyed__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EachUnkeyed__SvelteComponent_ = ReturnType<typeof EachUnkeyed__SvelteComponent_>;
export default EachUnkeyed__SvelteComponent_;
