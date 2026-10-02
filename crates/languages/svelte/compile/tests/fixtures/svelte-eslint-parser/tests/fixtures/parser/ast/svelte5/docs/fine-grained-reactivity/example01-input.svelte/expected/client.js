import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Example01_input($$anchor, $$props) {
	$.push($$props, true);

	let todos = $.state($.proxy([]));

	function remaining(todos) {
		console.log('recalculating');

		return todos.filter((todo) => !todo.done).length;
	}

	function addTodo(event) {
		if (event.key !== 'Enter') return;

		let done = $.state(false);
		let text = $.state($.proxy(event.target.value));

		$.set(
			todos,
			[
				...$.get(todos),
				{
					get done() {
						return $.get(done);
					},

					set done(value) {
						$.set(done, value, true);
					},

					get text() {
						return $.get(text);
					},

					set text(value) {
						$.set(text, value, true);
					}
				}
			],
			true
		);

		event.target.value = '';
	}

	$.pop();
}