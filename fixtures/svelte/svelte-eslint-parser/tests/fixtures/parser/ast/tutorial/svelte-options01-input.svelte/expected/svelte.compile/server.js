import * as $ from 'svelte/internal/server';
import Todo from './Todo.svelte';

export default function Svelte_options01_input($$renderer) {
	let todos = [
		{ id: 1, done: true, text: 'wash the car' },
		{ id: 2, done: false, text: 'take the dog for a walk' },
		{ id: 3, done: false, text: 'mow the lawn' }
	];

	function toggle(toggled) {
		todos = todos.map((todo) => {
			if (todo === toggled) {
				// return a new object
				return { id: todo.id, text: todo.text, done: !todo.done };
			}

			// return the same object
			return todo;
		});
	}

	$$renderer.push(`<h2>Todos</h2> <!--[-->`);

	const each_array = $.ensure_array_like(todos);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let todo = each_array[$$index];

		Todo($$renderer, { todo });
	}

	$$renderer.push(`<!--]-->`);
}