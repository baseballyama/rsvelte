import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';

export default function Main($$renderer) {
	let todos = [
		{ id: 1, done: false, description: 'write some docs' },
		{ id: 2, done: false, description: 'start writing JSConf talk' },
		{ id: 3, done: true, description: 'buy some milk' },
		{ id: 4, done: false, description: 'mow the lawn' },
		{ id: 5, done: false, description: 'feed the turtle' },
		{ id: 6, done: false, description: 'fix some bugs' }
	];

	function update() {
		todos = [...todos];
		todos.pop();
	}

	$$renderer.push(`<button>Remove last</button> <div class="list"><!--[-->`);

	const each_array = $.ensure_array_like(todos);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let todo = each_array[$$index];

		$$renderer.push(`<label><input type="checkbox"${$.attr('checked', todo.done, true)}/> ${$.escape(todo.description)}</label>`);
	}

	$$renderer.push(`<!--]--></div>`);
}