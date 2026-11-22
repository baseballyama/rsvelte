;
function $$render() {
  
	let selected = $state(1);
	let items = $state([
		{ id: 1, name: 'one', done: false },
		{ id: 2, name: 'two', done: true }
	]);

;

  async () => {
    {
      svelteHTML.createElement("ul", {});
      {
        for (let [, item] of __rsvelte_each(items)) {
          (item.id);
          {
            svelteHTML.createElement("li", {
              "class": "row",
            });
            (item.id === selected);
            (item.done);
            {
              svelteHTML.createElement("button", {
                "class": { current: item.id === selected },
                "onclick": () => (selected = item.id),
              });
              item.name;
            }
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ClassEach__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ClassEach__SvelteComponent_>} ClassEach__SvelteComponent_ */
export default ClassEach__SvelteComponent_;
