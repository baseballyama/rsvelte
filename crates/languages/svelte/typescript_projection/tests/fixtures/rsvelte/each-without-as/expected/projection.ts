;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { items = [], count = 2 } = $props();
	let item = $state('outer');

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    items: __rsvelte_array_prop(),
    count: 2,
  }, false);
  async () => {
    {
      for (let [, ] of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("p", {});
          item;
        }
      }
    }
    {
      for (let [i, ] of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("p", {});
          i;
        }
      }
    }
    {
      for (let [i, ] of __rsvelte_each({ length: count })) {
        {
          svelteHTML.createElement("span", {});
          i;
        }
      }
      {
      }
    }
    {
      for (let [, ] of __rsvelte_each({ length: 3 })) {
        {
          svelteHTML.createElement("b", {});
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const EachWithoutAs__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachWithoutAs__SvelteComponent_>} EachWithoutAs__SvelteComponent_ */
export default EachWithoutAs__SvelteComponent_;
