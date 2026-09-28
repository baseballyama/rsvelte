import * as $ from 'svelte/internal/server';
import ImmutableTodo from './ImmutableTodo.svelte';

export default function Main($$renderer) {
	let todos = [
		{ id: 1, done: false },
		{ id: 2, done: false },
		{ id: 3, done: false }
	];

	function toggle(id) {
		todos = todos.map((todo) => {
			if (todo.id === id) {
				return { id, done: !todo.done };
			}

			return todo;
		});
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(todos);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let todo = each_array[$$index];

		ImmutableTodo($$renderer, { todo });
	}

	$$renderer.push(`<!--]-->`);
}