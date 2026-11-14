;

	let people = $state([
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	]);

;

async () => {
  {
    for (let [, person] of __rsvelte_each(people)) {
      (person.id);
      {
        svelteHTML.createElement("p", {});
        (person.name);
      }
    }
  }
};
const EachKeyed__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachKeyed__SvelteComponent_>} */ (EachKeyed__SvelteComponent_);
