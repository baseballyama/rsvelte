import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><input type="checkbox"/> <input/> <button>x</button></li>`);

var root_1 = $.from_html(`<li>Nothing to do.</li>`);

var root_2 = $.from_html(`<h1>Todos</h1> <input placeholder="What needs doing?"/> <button>Add</button> <ul></ul> <p> </p> <button>Clear completed</button>`, 1);

export default function Todo_list($$anchor, $$props) {
	$.push($$props, true);
	let todos = $.state($.proxy([{ id: 1, text: 'Learn Svelte', done: true }, { id: 2, text: 'Build something', done: false }]));
	let draft = $.state('');
	let nextId = 3;
	let remaining = $.derived(() => $.get(todos).filter((t) => !t.done).length);
	function add() {
		if (!$.get(draft).trim()) return;
		$.get(todos).push({ id: nextId++, text: $.get(draft), done: false });
		$.set(draft, '');
	}
	function clear() {
		$.set(todos, $.get(todos).filter((t) => !t.done), true);
	}
	var fragment = root_2();
	var input = $.sibling($.first_child(fragment), 2);
	$.remove_input_defaults(input);
	var button = $.sibling(input, 2);
	var ul = $.sibling(button, 2);
	$.each(ul, 21, () => $.get(todos), (todo) => todo.id, ($$anchor, todo, $$index) => {
		var li = root();
		var input_1 = $.child(li);
		$.remove_input_defaults(input_1);
		var input_2 = $.sibling(input_1, 2);
		$.remove_input_defaults(input_2);
		var button_1 = $.sibling(input_2, 2);
		$.reset(li);
		$.bind_checked(input_1, () => $.get(todo).done, ($$value) => $.get(todo).done = $$value);
		$.bind_value(input_2, () => $.get(todo).text, ($$value) => $.get(todo).text = $$value);
		$.delegated('click', button_1, () => $.set(todos, $.get(todos).filter((t) => t !== $.get(todo)), true));
		$.append($$anchor, li);
	}, ($$anchor) => {
		var li_1 = root_1();
		$.append($$anchor, li_1);
	});
	$.reset(ul);
	var p = $.sibling(ul, 2);
	var text = $.only_child(p);
	var button_2 = $.sibling(p, 2);
	$.template_effect(() => $.set_text(text, `${$.get(remaining) ?? ''} remaining`));
	$.bind_value(input, () => $.get(draft), ($$value) => $.set(draft, $$value));
	$.delegated('click', button, add);
	$.delegated('click', button_2, clear);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
