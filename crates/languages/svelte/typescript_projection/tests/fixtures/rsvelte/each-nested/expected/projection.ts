;
function $$render() {
  
	let groups = $state([
		{ name: 'fruit', items: ['apple', 'pear'] },
		{ name: 'veg', items: ['leek'] }
	]);

;

  async () => {
    {
      for (let [, group] of __rsvelte_each(groups)) {
        {
          svelteHTML.createElement("h2", {});
          group.name;
        }
        {
          svelteHTML.createElement("ul", {});
          {
            for (let [, item] of __rsvelte_each(group.items)) {
              {
                svelteHTML.createElement("li", {});
                group.name;
                item;
              }
            }
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EachNested__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachNested__SvelteComponent_>} EachNested__SvelteComponent_ */
export default EachNested__SvelteComponent_;
