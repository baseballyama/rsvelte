;

	let names = $state(['Ada', 'Grace', 'Barbara']);

;

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
export default __rsvelte_export_component<Record<string, never>, {}, "">();
