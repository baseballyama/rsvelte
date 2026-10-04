;

	let n: number = 'x';
	let { label }: { label: string } = $props();
	let count = $state(0);
	let maybe: string | undefined = $state();

;

() => {
  {
    svelteHTML.createElement("button", {
      type: "button",
      onclick: () => count.toUpperCase(),
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
      title: `a${count.bar}b`,
    });
    (label.baz);
  }
};
export default __rsvelte_export_component<{ label: string }, {}, "">();
