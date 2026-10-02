import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';
import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

var root = $.from_html(`<label class="svelte-149gdhh"><input type="checkbox" class="svelte-149gdhh"/> <button class="svelte-149gdhh">remove</button></label>`);
var root_1 = $.from_html(`<label class="done svelte-149gdhh"><input type="checkbox" checked="" class="svelte-149gdhh"/> <button class="svelte-149gdhh">remove</button></label>`);
var root_2 = $.from_html(`<div class="board svelte-149gdhh"><input placeholder="what needs to be done?" class="svelte-149gdhh"/> <div class="left"><h2 class="svelte-149gdhh">todo</h2> <!></div> <div class="right"><h2 class="svelte-149gdhh">done</h2> <!></div></div>`);

export default function Animate_input($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_2();
	var input_1 = $.child(div);
	var div_1 = $.sibling(input_1, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	$.each(node_1, 25, () => todos.filter((t) => !t.done), (todo) => todo.id, ($$anchor, todo) => {
		var label = root();
		var input_2 = $.child(label);
		var text = $.sibling(input_2);
		var button = $.sibling(text);

		$.reset(label);
		$.template_effect(() => $.set_text(text, ` ${$.get(todo).description ?? ''} `));
		$.event('change', input_2, () => mark($.get(todo), true));
		$.event('click', button, () => remove($.get(todo)));
		$.transition(1, label, () => receive, () => ({ key: $.get(todo).id }));
		$.transition(2, label, () => send, () => ({ key: $.get(todo).id }));
		$.animation(label, () => flip, null);
		$.append($$anchor, label);
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.sibling($.child(div_2), 2);

	$.each(node_2, 25, () => todos.filter((t) => t.done), (todo) => todo.id, ($$anchor, todo) => {
		var label_1 = root_1();
		var input_3 = $.child(label_1);

		$.remove_input_defaults(input_3);

		var text_1 = $.sibling(input_3);
		var button_1 = $.sibling(text_1);

		$.reset(label_1);
		$.template_effect(() => $.set_text(text_1, ` ${$.get(todo).description ?? ''} `));
		$.event('change', input_3, () => mark($.get(todo), false));
		$.event('click', button_1, () => remove($.get(todo)));
		$.transition(1, label_1, () => receive, () => ({ key: $.get(todo).id }));
		$.transition(2, label_1, () => send, () => ({ key: $.get(todo).id }));
		$.animation(label_1, () => flip, () => ({ duration: 200 }));
		$.append($$anchor, label_1);
	});

	$.reset(div_2);
	$.reset(div);
	$.event('keydown', input_1, (e) => e.key === 'Enter' && add(e.target));
	$.append($$anchor, div);
	$.pop();
}