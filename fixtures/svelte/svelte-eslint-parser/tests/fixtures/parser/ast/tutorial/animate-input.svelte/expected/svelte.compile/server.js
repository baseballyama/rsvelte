import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';
import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

export default function Animate_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const [send, receive] = crossfade({
			duration: (d) => Math.sqrt(d * 200),
			fallback(node, params) {
				const style = getComputedStyle(node);
				const transform = style.transform === 'none' ? '' : style.transform;

				return {
					duration: 600,
					easing: quintOut,
					css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
				};
			}
		});

		let uid = 1;

		let todos = [
			{ id: uid++, done: false, description: 'write some docs' },
			{
				id: uid++,
				done: false,
				description: 'start writing blog post'
			},
			{ id: uid++, done: true, description: 'buy some milk' },
			{ id: uid++, done: false, description: 'mow the lawn' },
			{ id: uid++, done: false, description: 'feed the turtle' },
			{ id: uid++, done: false, description: 'fix some bugs' }
		];

		function add(input) {
			const todo = { id: uid++, done: false, description: input.value };

			todos = [todo, ...todos];
			input.value = '';
		}

		function remove(todo) {
			todos = todos.filter((t) => t !== todo);
		}

		function mark(todo, done) {
			todo.done = done;
			remove(todo);
			todos = todos.concat(todo);
		}

		$$renderer.push(`<div class="board svelte-149gdhh"><input placeholder="what needs to be done?" class="svelte-149gdhh"/> <div class="left"><h2 class="svelte-149gdhh">todo</h2> <!--[-->`);

		const each_array = $.ensure_array_like(todos.filter((t) => !t.done));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let todo = each_array[$$index];

			$$renderer.push(`<label class="svelte-149gdhh"><input type="checkbox" class="svelte-149gdhh"/> ${$.escape(todo.description)} <button class="svelte-149gdhh">remove</button></label>`);
		}

		$$renderer.push(`<!--]--></div> <div class="right"><h2 class="svelte-149gdhh">done</h2> <!--[-->`);

		const each_array_1 = $.ensure_array_like(todos.filter((t) => t.done));

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let todo = each_array_1[$$index_1];

			$$renderer.push(`<label class="done svelte-149gdhh"><input type="checkbox" checked="" class="svelte-149gdhh"/> ${$.escape(todo.description)} <button class="svelte-149gdhh">remove</button></label>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}