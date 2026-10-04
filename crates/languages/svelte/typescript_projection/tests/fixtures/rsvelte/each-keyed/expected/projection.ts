;

	let people = $state([
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	]);

;

() => {
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
export default __rsvelte_export_component<Record<string, never>, {}, "">();
