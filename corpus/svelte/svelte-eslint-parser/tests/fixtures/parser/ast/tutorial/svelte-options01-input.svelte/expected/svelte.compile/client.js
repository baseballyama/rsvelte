import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Todo from './Todo.svelte';

var root = $.from_html(`<h2>Todos</h2> <!>`, 1);

export default function Svelte_options01_input($$anchor) {
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

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(node, 17, () => todos, $.index, ($$anchor, todo) => {
		Todo($$anchor, {
			get todo() {
				return $.get(todo);
			},
			$$events: { click: () => toggle($.get(todo)) }
		});
	});

	$.append($$anchor, fragment);
}