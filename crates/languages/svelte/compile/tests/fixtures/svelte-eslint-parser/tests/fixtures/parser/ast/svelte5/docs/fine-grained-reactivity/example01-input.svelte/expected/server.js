import * as $ from 'svelte/internal/server';

export default function Example01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let todos = [];

		function remaining(todos) {
			console.log('recalculating');

			return todos.filter((todo) => !todo.done).length;
		}

		function addTodo(event) {
			if (event.key !== 'Enter') return;

			let done = false;
			let text = event.target.value;

			todos = [
				...todos,
				{
					get done() {
						return done;
					},

					set done(value) {
						done = value;
					},

					get text() {
						return text;
					},

					set text(value) {
						text = value;
					}
				}
			];

			event.target.value = '';
		}
	});
}