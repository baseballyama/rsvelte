;
function $$render() {
  
	let names = $state(['Ada', 'Grace', 'Barbara']);

;

  async () => {
    {
      svelteHTML.createElement("ul", {});
      {
        for (let name of __rsvelte_each(names)) {
          {
            svelteHTML.createElement("li", {});
            name;
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EachUnkeyed__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachUnkeyed__SvelteComponent_>} EachUnkeyed__SvelteComponent_ */
export default EachUnkeyed__SvelteComponent_;
