;

	let { class: className, ...rest }: typeof __rsvelte_public_props0 = $props();
	let count = $state(0);
	let active = $state(false);

	function extra() {
		return { 'data-extra': count };
	}

	function log() {
		console.log(count);
	}

;

const __rsvelte_public_props0 = __rsvelte_props({
  class: __rsvelte_untyped_prop(),
}, {}, true);
() => {
  {
    svelteHTML.createElement("div", {
      ...(rest),
      class: className,
      onclick: () => count++,
      "data-count": count,
    });
  }
  {
    svelteHTML.createElement("div", {
      ...(extra()),
      title: `n ${count}`,
    });
    (active);
  }
  {
    svelteHTML.createElement("p", {
      class: "note",
      ...(rest),
      onmouseenter: log,
      hidden: true,
    });
  }
  {
    svelteHTML.createElement("span", {
      ...({ role: 'status' }),
      "aria-live": "polite",
    });
    (count);
  }
  {
    svelteHTML.createElement("button", {
      type: "button",
      onclick: () => (active = !active),
    });
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
