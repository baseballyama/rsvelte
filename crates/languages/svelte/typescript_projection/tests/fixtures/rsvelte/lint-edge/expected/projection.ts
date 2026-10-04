;

	let { label }: typeof __rsvelte_public_props0 = $props();
	function f(a, b) {
		return b;
	}
	const g = (x = 1) => 0;
	let c = 0;
	c = c + 1;
	let d: number = 1;
	function h() {
		h();
	}
	f;
	g;

;

const __rsvelte_public_props0 = __rsvelte_props({
  label: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    svelteHTML.createElement("button", {
      type: "",
    });
  }
  {
    svelteHTML.createElement("button", {
      type: true,
    });
  }
  {
    svelteHTML.createElement("button", {
      type: "&#98;utton",
    });
  }
  {
    svelteHTML.createElement("button", {
      type: "foo",
    });
  }
  {
    svelteHTML.createElement("button", {
      type: label,
    });
  }
  {
    svelteHTML.createElement("button", {
      type: `a${label}`,
    });
  }
  {
    svelteHTML.createElement("button", {
      type,
    });
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
