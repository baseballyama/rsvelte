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
const EachUnkeyed__SvelteComponent_ = __rsvelte_export_component();
export default EachUnkeyed__SvelteComponent_;
