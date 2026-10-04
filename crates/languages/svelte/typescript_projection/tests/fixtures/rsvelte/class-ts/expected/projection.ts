;

	let active = $state(false);
	let level: number = $state(1);
	let tone: string = $state('warm');

;

() => {
  {
    svelteHTML.createElement("div", {
      class: { active, [tone]: level > 1 },
    });
    (level > 2);
  }
  {
    svelteHTML.createElement("div", {});
    (active.length);
  }
  {
    svelteHTML.createElement("button", {
      onclick: () => level++,
    });
    (level);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
