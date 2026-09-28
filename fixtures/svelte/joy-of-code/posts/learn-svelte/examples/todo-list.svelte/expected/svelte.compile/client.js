import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';

var root = $.from_html(`<li class="svelte-15bpv6s"><input type="checkbox" class="svelte-15bpv6s"/> <input type="text" class="svelte-15bpv6s"/> <button>🗙</button></li>`);
var root_1 = $.from_html(`<button> </button>`);
var root_2 = $.from_html(`<div class="container svelte-15bpv6s"><form><input type="text" placeholder="Add todo" class="svelte-15bpv6s"/></form> <ul class="svelte-15bpv6s"></ul> <div><p> </p> <!> <button>Clear completed</button></div></div>`);

export default function Todo_list($$anchor, $$props) {
	$.push($$props, true);

	let todo = $.state('');
	let todos = $.state($.proxy([]));
	let filter = $.state('all');
	let filteredTodos = $.derived(filterTodos);
	let remaining = $.derived(remainingTodos);

	function addTodo(e) {
		e.preventDefault();
		$.get(todos).push({ id: crypto.randomUUID(), text: $.get(todo), completed: false });
		$.set(todo, '');
	}

	function removeTodo(todo) {
		$.set(todos, $.get(todos).filter((t) => t.id !== todo.id), true);
	}

	function filterTodos() {
		return $.get(todos).filter((todo) => {
			if ($.get(filter) === 'all') return true;
			if ($.get(filter) === 'active') return !todo.completed;
			if ($.get(filter) === 'completed') return todo.completed;
		});
	}

	function setFilter(newFilter) {
		$.set(filter, newFilter, true);
	}

	function remainingTodos() {
		return $.get(todos).filter((todo) => !todo.completed).length;
	}

	function clearCompleted() {
		$.set(todos, $.get(todos).filter((todo) => !todo.completed), true);
	}

	var div = root_2();
	var form = $.child(div);
	var input = $.child(form);

	$.remove_input_defaults(input);
	$.reset(form);

	var ul = $.sibling(form, 2);

	$.each(ul, 21, () => $.get(filteredTodos), (todo) => todo.id, ($$anchor, todo, $$index, $$array) => {
		var li = root();
		var input_1 = $.child(li);

		$.remove_input_defaults(input_1);

		var input_2 = $.sibling(input_1, 2);

		$.remove_input_defaults(input_2);

		var button = $.sibling(input_2, 2);

		$.reset(li);
		$.bind_checked(input_1, () => $.get(todo).completed, ($$value) => ($.get(todo).completed = $$value));
		$.bind_value(input_2, () => $.get(todo).text, ($$value) => ($.get(todo).text = $$value));
		$.delegated('click', button, () => removeTodo($.get(todo)));
		$.transition(3, li, () => slide);
		$.append($$anchor, li);
	});

	$.reset(ul);

	var div_1 = $.sibling(ul, 2);
	var p = $.child(div_1);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	$.each(node, 16, () => ['all', 'active', 'completed'], $.index, ($$anchor, filter, $$index_1, $$array_1) => {
		var button_1 = root_1();
		var text_1 = $.only_child(button_1, true);

		$.template_effect(() => $.set_text(text_1, filter));
		$.delegated('click', button_1, () => setFilter(filter));
		$.append($$anchor, button_1);
	});

	var button_2 = $.sibling(node, 2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(remaining) ?? ''} ${$.get(remaining) === 1 ? 'item' : 'items'} left`));
	$.event('submit', form, addTodo);
	$.bind_value(input, () => $.get(todo), ($$value) => $.set(todo, $$value));
	$.delegated('click', button_2, clearCompleted);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);