;

	let tasks = $state([
		{ text: 'write', done: true },
		{ text: 'test', done: false }
	]);

;

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
export default __rsvelte_export_component<Record<string, never>, {}, "">();
