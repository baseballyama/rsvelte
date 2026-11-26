;
function $$render() {
  
	let rows = $state([{ id: 'a' }, { id: 'b' }]);

;

  async () => {
    {
      svelteHTML.createElement("div", {});
      {
        for (let row of __rsvelte_each(rows)) {
          let index = 1;
          (row.id);
          {
            svelteHTML.createElement("span", {});
            index;
            row.id;
          }
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EachKeyedIndex__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachKeyedIndex__SvelteComponent_>} EachKeyedIndex__SvelteComponent_ */
export default EachKeyedIndex__SvelteComponent_;
