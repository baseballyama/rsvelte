;

	let active = $state(false);
	let level: number = $state(1);
	let tone: string = $state('warm');

;

async () => {
  {
    svelteHTML.createElement("div", {
      "class": { active, [tone]: level > 1 },
    });
    (level > 2);
  }
  {
    svelteHTML.createElement("div", {});
    (active.length);
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => level++,
    });
    (level);
  }
};
const ClassTs__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ClassTs__SvelteComponent_ = ReturnType<typeof ClassTs__SvelteComponent_>;
export default ClassTs__SvelteComponent_;
