;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { f, x, items } = $props();
	let n = $state(1);

;

  const __rsvelte_public_props0 = __rsvelte_props({
    f: __rsvelte_untyped_prop(),
    x: __rsvelte_untyped_prop(),
    items: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("div", {});
      __sveltets_2_ensureType(String, Number, `${f(x) + n}px`);
      __sveltets_2_ensureType(String, Number, `${n}px`);
      __sveltets_2_ensureType(String, Number, f(n));
      __sveltets_2_ensureType(String, Number, "red");
      __sveltets_2_ensureType(String, Number, `translate(${f(1)}, ${n})`);
    }
    {
      svelteHTML.createElement("div", {
        ...(items),
      });
      __sveltets_2_ensureType(String, Number, `${f(x)}px`);
    }
    {
      __rsvelte_component(Comp)(__rsvelte_internals(), {
        ...(__sveltets_2_cssProp({
          "--a": `${f(n)}px`,
        })),
      });
    }
    {
      for (let [, item] of __rsvelte_each(items)) {
        (item.key);
        {
          svelteHTML.createElement("span", {});
          __sveltets_2_ensureType(String, Number, `${f(item.x)}px`);
          item.k;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const StyleQuotedCall__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof StyleQuotedCall__SvelteComponent_>} StyleQuotedCall__SvelteComponent_ */
export default StyleQuotedCall__SvelteComponent_;
