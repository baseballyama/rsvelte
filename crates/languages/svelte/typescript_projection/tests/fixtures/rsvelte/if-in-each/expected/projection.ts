;

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
const IfInEach__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type IfInEach__SvelteComponent_ = ReturnType<typeof IfInEach__SvelteComponent_>;
export default IfInEach__SvelteComponent_;
