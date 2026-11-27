;
function $$render() {
  
	let /** @typedef {{ v?: number, o: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { v = 1, o } = $props();
	let s = $state(2);

;

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
        s;
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
        ...(__sveltets_2_empty({
          "data-a": s,
        })),
      });
      __sveltets_2_ensureType(String, Number, "red");
      (s);
    }
    {
      svelteHTML.createElement("p", {
        "title": "t",
        "is": "my-p",
        ...(__sveltets_2_empty({
          "data-x": Math.max(v, 1),
        })),
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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const CustomElementAttributes__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof CustomElementAttributes__SvelteComponent_>} CustomElementAttributes__SvelteComponent_ */
export default CustomElementAttributes__SvelteComponent_;
