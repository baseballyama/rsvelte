;
function $$render() {
  
	let tasks = $state([
		{ text: 'write', done: true },
		{ text: 'test', done: false }
	]);

;

  async () => {
    {
      for (let [, task] of __rsvelte_each(tasks)) {
        if (task.done) {
          {
            svelteHTML.createElement("s", {});
            (task.text);
          }
        } else {
          {
            svelteHTML.createElement("b", {});
            (task.text);
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const IfInEach__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof IfInEach__SvelteComponent_>} */ (IfInEach__SvelteComponent_);
