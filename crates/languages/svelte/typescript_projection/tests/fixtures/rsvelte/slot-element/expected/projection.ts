;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { items, rest } = $props();
	let count = $state(0);

;

  const __rsvelte_public_props0 = __rsvelte_props({
    items: __rsvelte_untyped_prop(),
    rest: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("ul", {});
      {
        __rsvelte_slots()("default", {});
      }
    }
    {
      __rsvelte_slots()("header", {
        "title": "Hi",
        count,
        "total": items.length,
        "first": items.at(0),
        ...(rest),
      });
      {
        svelteHTML.createElement("p", {});
        count;
      }
    }
    {
      svelteHTML.createElement("div", {});
      {
        __rsvelte_slots()("footer", {
          "label": `a ${count} b`,
        });
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => count++,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic_slots<typeof __rsvelte_public_props0, { [evt: string]: CustomEvent<any> }, {}, "">} */ (__rsvelte_export_isomorphic_slots))()({
    "default": {},
    "header": {
      title: "",
      count: count,
      total: items.length,
      first: items.at(0),
      ...(rest),
    },
    "footer": {
      label: "",
    },
  });
}
export const SlotElement__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SlotElement__SvelteComponent_>} SlotElement__SvelteComponent_ */
export default SlotElement__SvelteComponent_;
