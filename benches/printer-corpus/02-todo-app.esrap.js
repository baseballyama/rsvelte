import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<p class="empty">Nothing here.</p>`);
var root_2 = $.from_html(`<li><label class="svelte-sbbj5z"><input type="checkbox"/> </label> <button class="remove">×</button></li>`);
var root_3 = $.from_html(`<ul class="svelte-sbbj5z"></ul>`);
var root_4 = $.from_html(`<section class="todo svelte-sbbj5z"><header class="svelte-sbbj5z"><h1>Todos</h1> <span class="count"> </span></header> <form><input placeholder="What needs doing?"/> <button type="submit">Add</button></form> <nav class="filters svelte-sbbj5z"></nav> <!> <footer><button>Clear completed</button></footer></section>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let nextId = $.state(4);
	let draft = $.state('');
	let filter = $.state('all');

	let todos = $.state($.proxy([
		{ id: 1, text: 'Learn Svelte', done: true },
		{ id: 2, text: 'Build something', done: false },
		{ id: 3, text: 'Ship it', done: false }
	]));

	let remaining = $.derived(() => $.get(todos).filter((t) => !t.done).length);

	let visible = $.derived(() => $.get(todos).filter((t) => {
		if ($.get(filter) === 'active') return !t.done;
		if ($.get(filter) === 'completed') return t.done;

		return true;
	}));

	function add() {
		const text = $.get(draft).trim();

		if (!text) return;

		$.set(todos, [...$.get(todos), { id: $.update(nextId), text, done: false }], true);
		$.set(draft, '');
	}

	function toggle(id) {
		$.set(todos, $.get(todos).map((t) => t.id === id ? { ...t, done: !t.done } : t), true);
	}

	function remove(id) {
		$.set(todos, $.get(todos).filter((t) => t.id !== id), true);
	}

	function clearCompleted() {
		$.set(todos, $.get(todos).filter((t) => !t.done), true);
	}

	var section = root_4();
	var header = $.child(section);
	var span = $.sibling($.child(header), 2);
	var text_1 = $.child(span);

	$.reset(span);
	$.reset(header);

	var form = $.sibling(header, 2);
	var input = $.child(form);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.reset(form);

	var nav = $.sibling(form, 2);

	$.each(nav, 20, () => ['all', 'active', 'completed'], $.index, ($$anchor, name) => {
		var button_1 = root();
		let classes;
		var text_2 = $.child(button_1, true);

		$.reset(button_1);

		$.template_effect(() => {
			classes = $.set_class(button_1, 1, 'svelte-sbbj5z', null, classes, { active: $.get(filter) === name });
			$.set_text(text_2, name);
		});

		$.delegated('click', button_1, () => $.set(filter, name, true));
		$.append($$anchor, button_1);
	});

	$.reset(nav);

	var node = $.sibling(nav, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var ul = root_3();

			$.each(ul, 21, () => $.get(visible), (todo) => todo.id, ($$anchor, todo) => {
				var li = root_2();
				let classes_1;
				var label = $.child(li);
				var input_1 = $.child(label);

				$.remove_input_defaults(input_1);

				var text_3 = $.sibling(input_1);

				$.reset(label);

				var button_2 = $.sibling(label, 2);

				$.reset(li);

				$.template_effect(() => {
					classes_1 = $.set_class(li, 1, 'svelte-sbbj5z', null, classes_1, { done: $.get(todo).done });
					$.set_checked(input_1, $.get(todo).done);
					$.set_text(text_3, ` ${$.get(todo).text ?? ''}`);
				});

				$.delegated('change', input_1, () => toggle($.get(todo).id));
				$.delegated('click', button_2, () => remove($.get(todo).id));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.append($$anchor, ul);
		};

		$.if(node, ($$render) => {
			if ($.get(visible).length === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var footer = $.sibling(node, 2);
	var button_3 = $.child(footer);

	$.reset(footer);
	$.reset(section);

	$.template_effect(
		($0) => {
			$.set_text(text_1, `${$.get(remaining) ?? ''} left`);
			button.disabled = $0;
		},
		[() => !$.get(draft).trim()]
	);

	$.event('submit', form, (e) => {
		e.preventDefault();
		add();
	});

	$.bind_value(input, () => $.get(draft), ($$value) => $.set(draft, $$value));
	$.delegated('click', button_3, clearCompleted);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click', 'change']);
