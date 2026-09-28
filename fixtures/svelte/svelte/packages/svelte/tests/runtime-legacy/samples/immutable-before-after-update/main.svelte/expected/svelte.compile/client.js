import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ImmutableTodo from './ImmutableTodo.svelte';

export default function Main($$anchor) {
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => todos, $.index, ($$anchor, todo) => {
		ImmutableTodo($$anchor, {
			get todo() {
				return $.get(todo);
			},
			$$events: { click: () => toggle($.get(todo).id) }
		});
	});

	$.append($$anchor, fragment);
}