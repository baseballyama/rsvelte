;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { items, pairs, fixed } = $props();
	let fallback = $state('none');
	const plain = [{ name: 'a', tags: ['x'] }];

;

  const __rsvelte_public_props0 = __rsvelte_props({
    items: __rsvelte_untyped_prop(),
    pairs: __rsvelte_untyped_prop(),
    fixed: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      for (let { id, name, size = 1, ...rest } of __rsvelte_each(items)) {
        (id);
        {
          svelteHTML.createElement("p", {});
          id;
          name;
          size;
          rest.extra;
        }
      }
    }
    {
      for (let [key, value] of __rsvelte_each(pairs)) {
        let i = 1;
        {
          svelteHTML.createElement("span", {});
          i;
          key;
          value;
        }
      }
    }
    {
      for (let { name, tags: [first = fallback] } of __rsvelte_each(plain)) {
        {
          svelteHTML.createElement("b", {});
          name;
          first;
        }
      }
    }
    {
      for (let { label } of __rsvelte_each(fixed)) {
        {
          svelteHTML.createElement("i", {});
          label;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const EachDestructure__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachDestructure__SvelteComponent_>} EachDestructure__SvelteComponent_ */
export default EachDestructure__SvelteComponent_;
