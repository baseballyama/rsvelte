;
function $$render() {
  
	let people = $state([
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	]);

;

  async () => {
    {
      for (let person of __rsvelte_each(people)) {
        (person.id);
        {
          svelteHTML.createElement("p", {});
          person.name;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EachKeyed__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachKeyed__SvelteComponent_>} EachKeyed__SvelteComponent_ */
export default EachKeyed__SvelteComponent_;
