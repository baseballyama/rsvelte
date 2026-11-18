;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { class: className, ...rest } = $props();
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
  async () => {
    {
      svelteHTML.createElement("div", {
        ...(rest),
        "class": className,
        "onclick": () => count++,
        ...(__sveltets_2_empty({
          "data-count": count,
        })),
      });
    }
    {
      svelteHTML.createElement("div", {
        ...(extra()),
        "title": `n ${count}`,
      });
      (active);
    }
    {
      svelteHTML.createElement("p", {
        "class": "note",
        ...(rest),
        "onmouseenter": log,
        "hidden": true,
      });
    }
    {
      svelteHTML.createElement("span", {
        ...({ role: 'status' }),
        "aria-live": "polite",
      });
      count;
    }
    {
      svelteHTML.createElement("button", {
        "type": "button",
        "onclick": () => (active = !active),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const SpreadMixed__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof SpreadMixed__SvelteComponent_>} */ (SpreadMixed__SvelteComponent_);
