;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { class: className, ...rest } = $props();
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
export const SpreadMixed__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SpreadMixed__SvelteComponent_>} SpreadMixed__SvelteComponent_ */
export default SpreadMixed__SvelteComponent_;
