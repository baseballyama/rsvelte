import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { globalOpts } from '@components/global-opts/globalopts.svelte';
import Inspect, { addToPanel } from 'svelte-inspect-value';
import { flip } from 'svelte/animate';
import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

var root = $.from_html(`<p style="background-color: var(--_background-color); width: 100%; padding: 0.5em; border-radius: var(--_border-radius); border: 1px solid var(--_border-color); text-align: center" class="svelte-1d9ipi1">👈 Try resizing the panel!<br/> Double-click the edge to reset size.</p>`);
var root_1 = $.from_html(`<label class="svelte-1d9ipi1"><input type="checkbox" class="svelte-1d9ipi1"/> <button class="svelte-1d9ipi1">x</button> <button class="svelte-1d9ipi1">i</button></label>`);
var root_2 = $.from_html(`<label class="svelte-1d9ipi1"><input type="checkbox" class="svelte-1d9ipi1"/> <button class="svelte-1d9ipi1">x</button></label>`);
var root_3 = $.from_html(`<!> <div id="panel-example" class="svelte-1d9ipi1"><button>fullscreen</button> <div class="board svelte-1d9ipi1"><input class="new-todo svelte-1d9ipi1" name="new-todo" placeholder="what needs to be done?"/> <div class="left svelte-1d9ipi1"><h2 class="svelte-1d9ipi1">todo</h2> <!></div> <div class="right svelte-1d9ipi1"><h2 class="svelte-1d9ipi1">done</h2> <!></div></div> <!></div>`, 1);

export default function Todo($$anchor, $$props) {
	$.push($$props, true);

	let board;

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

	let todos = $.state($.proxy([
		{ id: 1, done: false, description: 'write some docs' },
		{ id: 2, done: false, description: 'tune the banjo' },
		{ id: 3, done: false, description: 'fix some bugs' },
		{ id: 4, done: false, description: 'mow the lawn' },
		{ id: 5, done: true, description: 'feed the turtle' }
	]));

	// svelte-ignore state_referenced_locally
	let uid = $.get(todos).length + 1;

	// @ts-expect-error foo
	function add(input) {
		const todo = { id: uid++, done: false, description: input.value };

		$.set(todos, [todo, ...$.get(todos)], true);
		input.value = '';
	}

	// @ts-expect-error foo
	function remove(todo) {
		$.set(todos, $.get(todos).filter((t) => t !== todo), true);
	}

	let todo = $.derived(() => $.get(todos).filter((t) => !t.done));
	let done = $.derived(() => $.get(todos).filter((t) => t.done));

	addToPanel(
		'isTurtleFed',
		() => {
			const turtle = $.get(todos).find((t) => t.description.includes('turtle'));

			if (turtle) {
				return turtle.done;
			}

			return 'dunno';
		},
		'App.svelte'
	);

	addToPanel('allTodos', () => $.get(todos), 'Added manually');

	function requestfullscreen(event) {
		board.requestFullscreen();
	}

	var fragment = root_3();
	var node_1 = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ todo: $.get(todo), done: $.get(done) }));

		$.component(node_1, () => Inspect.Panel, ($$anchor, Inspect_Panel) => {
			Inspect_Panel($$anchor, $.spread_props(() => globalOpts, {
				get values() {
					return $.get($0);
				},
				align: 'right bottom',
				heading: 'todos',
				expandLevel: 1,
				previewEntries: Infinity,
				style: 'position:absolute',
				appearance: 'solid',
				open: true,
				zIndex: 999,
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			}));
		});
	}

	var div = $.sibling(node_1, 2);
	var button = $.child(div);
	var div_1 = $.sibling(button, 2);
	var input_1 = $.child(div_1);
	var div_2 = $.sibling(input_1, 2);
	var node_2 = $.sibling($.child(div_2), 2);

	$.each(node_2, 25, () => $.get(todos).filter((t) => !t.done), (todo) => todo.id, ($$anchor, todo, $$index, $$array) => {
		var label = root_1();
		var input_2 = $.child(label);

		$.remove_input_defaults(input_2);

		var text = $.sibling(input_2);
		var button_1 = $.sibling(text);
		var button_2 = $.sibling(button_1, 2);

		$.reset(label);

		$.template_effect(() => {
			$.set_attribute(input_2, 'name', $.get(todo).description);
			$.set_text(text, ` ${$.get(todo).description ?? ''} `);
		});

		$.bind_checked(input_2, () => $.get(todo).done, ($$value) => ($.get(todo).done = $$value));
		$.delegated('click', button_1, () => remove($.get(todo)));
		$.delegated('click', button_2, () => addToPanel(`todo.${$.get(todo).id}`, () => $.get(todo)));
		$.transition(1, label, () => receive, () => ({ key: $.get(todo).id }));
		$.transition(2, label, () => send, () => ({ key: $.get(todo).id }));
		$.animation(label, () => flip, null);
		$.append($$anchor, label);
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.sibling($.child(div_3), 2);

	$.each(node_3, 25, () => $.get(todos).filter((t) => t.done), (todo) => todo.id, ($$anchor, todo, $$index_1, $$array_1) => {
		var label_1 = root_2();
		var input_3 = $.child(label_1);

		$.remove_input_defaults(input_3);

		var text_1 = $.sibling(input_3);
		var button_3 = $.sibling(text_1);

		$.reset(label_1);

		$.template_effect(() => {
			$.set_attribute(input_3, 'name', $.get(todo).description);
			$.set_text(text_1, ` ${$.get(todo).description ?? ''} `);
		});

		$.bind_checked(input_3, () => $.get(todo).done, ($$value) => ($.get(todo).done = $$value));
		$.delegated('click', button_3, () => remove($.get(todo)));
		$.transition(1, label_1, () => receive, () => ({ key: $.get(todo).id }));
		$.transition(2, label_1, () => send, () => ({ key: $.get(todo).id }));
		$.animation(label_1, () => flip, null);
		$.append($$anchor, label_1);
	});

	$.reset(div_3);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => ({ msg: 'add to panel from here 👉', allTodos: $.get(todos) }));

		Inspect(node_4, $.spread_props(() => globalOpts, {
			get values() {
				return $.get($0);
			},
			showLength: false,
			name: 'all',
			style: 'max-width: 420px'
		}));
	}

	$.reset(div);
	$.bind_this(div, ($$value) => board = $$value, () => board);
	$.delegated('click', button, requestfullscreen);
	$.delegated('keydown', input_1, (event) => event.key === 'Enter' && add(event.target));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);