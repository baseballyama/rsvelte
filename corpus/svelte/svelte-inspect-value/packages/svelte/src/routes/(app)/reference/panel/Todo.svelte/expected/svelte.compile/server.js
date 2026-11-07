import * as $ from 'svelte/internal/server';
import Inspect, { addToPanel } from '$lib/index.js';
import { flip } from 'svelte/animate';
import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

export default function Todo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const [send, receive] = crossfade({
			fallback(node) {
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

		let todos = [
			{ id: 1, done: false, description: 'write some docs' },
			{ id: 2, done: false, description: 'tune the banjo' },
			{ id: 3, done: false, description: 'fix some bugs' },
			{ id: 4, done: false, description: 'mow the lawn' },
			{ id: 5, done: true, description: 'feed the turtle' }
		];

		// svelte-ignore state_referenced_locally
		let uid = todos.length + 1;

		// @ts-expect-error foo
		function add(input) {
			const todo = { id: uid++, done: false, description: input.value };

			todos = [todo, ...todos];
			input.value = '';
		}

		// @ts-expect-error foo
		function remove(todo) {
			todos = todos.filter((t) => t !== todo);
		}

		let todo = $.derived(() => todos.filter((t) => !t.done));
		let done = $.derived(() => todos.filter((t) => t.done));

		addToPanel(
			'isTurtleFed',
			() => {
				const turtle = todos.find((t) => t.description.includes('turtle'));

				if (turtle) {
					return turtle.done;
				}

				return 'dunno';
			},
			'Todo.svelte'
		);

		addToPanel('allTodos', () => todos, 'Added manually');

		Inspect($$renderer, {
			values: { msg: 'add to panel from here!!', allTodos: todos },
			showLength: false,
			name: 'all',
			style: 'max-width: 420px'
		});

		$$renderer.push(`<!----> `);

		if (Inspect.Panel) {
			$$renderer.push('<!--[-->');

			Inspect.Panel($$renderer, {
				values: { todo: todo(), done: done() },
				persist: 'siv.doc-todo-example',
				heading: 'todos',
				expandLevel: 0,
				previewEntries: Infinity,
				style: 'position:absolute',
				appearance: 'solid',
				open: true,
				zIndex: 999,
				children: ($$renderer) => {
					$$renderer.push(`<p style="background-color: var(--_background-color); padding: 0.5em; border-radius: var(--_border-radius); border: 1px solid var(--_border-color);" class="svelte-1wb39yq">👈 try resizing the panel!</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <div class="board svelte-1wb39yq"><input class="new-todo svelte-1wb39yq" name="new-todo" placeholder="what needs to be done?"/> <div class="left svelte-1wb39yq"><h2 class="svelte-1wb39yq">todo</h2> <!--[-->`);

		const each_array = $.ensure_array_like(todos.filter((t) => !t.done));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let todo = each_array[$$index];

			$$renderer.push(`<label class="svelte-1wb39yq"><input${$.attr('name', todo.description)} type="checkbox"${$.attr('checked', todo.done, true)} class="svelte-1wb39yq"/> ${$.escape(todo.description)} <button class="svelte-1wb39yq">x</button> <button class="svelte-1wb39yq">i</button></label>`);
		}

		$$renderer.push(`<!--]--></div> <div class="right svelte-1wb39yq"><h2 class="svelte-1wb39yq">done</h2> <!--[-->`);

		const each_array_1 = $.ensure_array_like(todos.filter((t) => t.done));

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let todo = each_array_1[$$index_1];

			$$renderer.push(`<label class="svelte-1wb39yq"><input${$.attr('name', todo.description)} type="checkbox"${$.attr('checked', todo.done, true)} class="svelte-1wb39yq"/> ${$.escape(todo.description)} <button class="svelte-1wb39yq">x</button></label>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}