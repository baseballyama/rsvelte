import * as $ from 'svelte/internal/server';

export default function Todo_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let todos = [{ id: 1, text: 'Learn Svelte', done: true }, { id: 2, text: 'Build something', done: false }];
		let draft = '';
		let nextId = 3;
		let remaining = $.derived(() => todos.filter((t) => !t.done).length);
		function add() {
			if (!draft.trim()) return;
			todos.push({ id: nextId++, text: draft, done: false });
			draft = '';
		}
		function clear() {
			todos = todos.filter((t) => !t.done);
		}
		$$renderer.push(`<h1>Todos</h1> <input${$.attr('value', draft)} placeholder="What needs doing?"/> <button>Add</button> <ul>`);
		const each_array = $.ensure_array_like(todos);
		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let todo = each_array[$$index];
				$$renderer.push(`<li><input type="checkbox"${$.attr('checked', todo.done, true)}/> <input${$.attr('value', todo.text)}/> <button>x</button></li>`);
			}
		} else {
			$$renderer.push(`<!--[!--><li>Nothing to do.</li>`);
		}
		$$renderer.push(`<!--]--></ul> <p>${$.escape(remaining())} remaining</p> <button>Clear completed</button>`);
	});
}
