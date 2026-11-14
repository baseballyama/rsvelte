;

	let { v = 1, o }: typeof __rsvelte_public_props0 = $props();
	let s = $state(2);

;

const __rsvelte_public_props0 = __rsvelte_props({
  o: __rsvelte_untyped_prop(),
}, {
  v: 1,
}, false);
async () => {
  {
    svelteHTML.createElement("my-el", {
      "a": "1",
      "b": v,
      "c": s,
      "class": "x",
      "style": "color: red",
      "onclick": () => s++,
    });
  }
  {
    svelteHTML.createElement("lite-youtube", {
      "videoid": "abc",
      "params": `x=${v}`,
    });
  }
  {
    svelteHTML.createElement("x-foo", {
      ...(o),
      "d": s,
    });
    {
      svelteHTML.createElement("span", {});
      (s);
    }
  }
  {
    o = svelteHTML.createElement("x-bar", {});
  }
  {
    svelteHTML.createElement("div", {
      "is": "my-div",
      "title": v,
    });
  }
  {
    svelteHTML.createElement("x-baz", {
      "data-a": s,
    });
    __sveltets_2_ensureType(String, Number, "red");
    (s);
  }
  {
    svelteHTML.createElement("p", {
      "title": "t",
      "is": "my-p",
      "data-x": Math.max(v, 1),
      "fooBar": "Q",
    });
  }
  {
    svelteHTML.createElement("x-qux", {
      ...(o),
      "fooBar": "Q",
    });
  }
};
const CustomElementAttributes__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type CustomElementAttributes__SvelteComponent_ = ReturnType<typeof CustomElementAttributes__SvelteComponent_>;
export default CustomElementAttributes__SvelteComponent_;
