;

	let n: number = 'x';
	type __rsvelte_props_type0 = { label: string };
let { label }: __rsvelte_props_type0 = $props();
	let count = $state(0);
	let maybe: string | undefined = $state();

;

async () => {
  {
    svelteHTML.createElement("button", {
      "type": "button",
      "onclick": () => count.toUpperCase(),
    });
    (label.foo);
  }
  if (maybe) {
    {
      svelteHTML.createElement("p", {});
      (maybe.length);
    }
  } else {
    {
      svelteHTML.createElement("p", {});
      (maybe.length);
    }
  }
  {
    svelteHTML.createElement("p", {
      "title": `a${count.bar}b`,
    });
    (label.baz);
  }
};
const CheckCases__SvelteComponent_ = __rsvelte_export_component<__rsvelte_props_type0, {}, "">();
type CheckCases__SvelteComponent_ = ReturnType<typeof CheckCases__SvelteComponent_>;
export default CheckCases__SvelteComponent_;
