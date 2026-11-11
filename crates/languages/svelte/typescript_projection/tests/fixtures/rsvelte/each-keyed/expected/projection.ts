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
const EachKeyed__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EachKeyed__SvelteComponent_ = ReturnType<typeof EachKeyed__SvelteComponent_>;
export default EachKeyed__SvelteComponent_;
