;
function $$render() {
  
	let tasks = $state([
		{ text: 'write', done: true },
		{ text: 'test', done: false }
	]);

;

  async () => {
    {
      for (let task of __rsvelte_each(tasks)) {
        if (task.done) {
          {
            svelteHTML.createElement("s", {});
            task.text;
          }
        } else {
          {
            svelteHTML.createElement("b", {});
            task.text;
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const IfInEach__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof IfInEach__SvelteComponent_>} IfInEach__SvelteComponent_ */
export default IfInEach__SvelteComponent_;
