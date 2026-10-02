import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { withModifiers, withKeys, vModelText, renderList, normalizeClass, vModelCheckbox, toDisplayString } from 'vue';

import { untrack } from 'svelte';

var root = $.from_html(`<li><label><input type="checkbox"/> </label></li>`);

var root_1 = $.from_html(`<button class="clear">clear done</button>`);

var root_2 = $.from_html(`<form class="new"><input class="draft" placeholder="What needs doing?"/><button class="add">add</button></form><ul class="todos"></ul><p class="summary"><span> </span> <span> </span></p><!>`, 1);

export default function Todo_vue($$anchor, $$props) {
	$.push($$props, true);
	const vmodelBindings = new WeakMap();
	function vmodel(dir, value_2, modifiers, props) {
		if (dir.deep) traverse(value_2);
		return (el) => untrack(() => {
			const vnode = { props: props };
			let binding = vmodelBindings.get(el);
			if (binding === undefined) {
				binding = { value: value_2, oldValue: undefined, modifiers: modifiers };
				vmodelBindings.set(el, binding);
				dir.created?.(el, binding, vnode);
				dir.mounted?.(el, binding, vnode);
			} else {
				binding.oldValue = binding.value;
				binding.value = value_2;
				dir.beforeUpdate?.(el, binding, vnode);
				dir.updated?.(el, binding, vnode);
			}
		});
	}
	function traverse(value_2, seen = new Set()) {
		if (typeof value_2 !== 'object' || value_2 === null || seen.has(value_2)) return;
		seen.add(value_2);
		if (Array.isArray(value_2)) for (let i = 0; i < value_2.length; i++) traverse(value_2[i], seen); else if (value_2 instanceof Set || value_2 instanceof Map) value_2.forEach((item) => traverse(item, seen)); else if (Object.prototype.toString.call(value_2) === '[object Object]') {
			const keys = Object.keys(value_2);
			for (let i = 0; i < keys.length; i++) traverse(value_2[keys[i]], seen);
		}
	}
	function includeBooleanAttr(value_3) {
		return !!value_3 || value_3 === '';
	}
	let todos = $.state($.proxy([{ id: 1, text: 'write tests', done: true }]));
	let draft = $.state('');
	let next = 2;
	let remaining = $.derived(() => $.get(todos).filter((t) => !t.done).length);
	function add() {
		const text = $.get(draft).trim();
		if (!text) return;
		$.get(todos).push({ id: next++, text, done: false });
		$.set(draft, '');
	}
	function clearDone() {
		$.set(todos, $.get(todos).filter((t) => !t.done), true);
	}
	var fragment = root_2();
	var form = $.first_child(fragment);
	var event_handler = $.derived(() => withModifiers(add, ['prevent']));
	var input = $.child(form);
	var event_handler_1 = $.derived(() => withKeys((event) => $.set(draft, ''), ['escape']));
	$.attach(input, () => vmodel(vModelText, $.get(draft), {}, { 'onUpdate:modelValue': (value_1) => $.set(draft, value_1, true) }));
	var button = $.sibling(input);
	$.reset(form);
	var ul = $.sibling(form);
	$.each(ul, 21, () => renderList($.get(todos), (value_4) => value_4), (todo) => todo.id, ($$anchor, todo, $$index) => {
		var li = root();
		var label = $.child(li);
		var input_1 = $.child(label);
		$.attach(input_1, () => vmodel(vModelCheckbox, $.get(todo).done, {}, { 'onUpdate:modelValue': (value_5) => $.get(todo).done = value_5, type: 'checkbox' }));
		var text_1 = $.sibling(input_1);
		$.reset(label);
		$.reset(li);
		$.template_effect(($0, $1) => {
			$.set_class(li, 1, $0);
			$.set_text(text_1, ` ${$1 ?? ''}`);
		}, [() => $.clsx(normalizeClass([{ done: $.get(todo).done }])), () => toDisplayString($.get(todo).text)]);
		$.append($$anchor, li);
	});
	$.reset(ul);
	var p = $.sibling(ul);
	var span = $.child(p);
	var text_2 = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_3 = $.only_child(span_1);
	$.reset(p);
	var node = $.sibling(p);
	{
		var consequent = ($$anchor) => {
			var button_1 = root_1();
			$.delegated('click', button_1, clearDone);
			$.append($$anchor, button_1);
		};
		var d = $.derived(() => $.get(todos).some((t) => t.done));
		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}
	$.template_effect(($0, $1, $2) => {
		button.disabled = $0;
		$.set_text(text_2, $1);
		$.set_text(text_3, `${$2 ?? ''} left`);
	}, [() => includeBooleanAttr(!$.get(draft).trim()), () => toDisplayString($.get(remaining)), () => toDisplayString($.get(remaining) === 1 ? 'item' : 'items')]);
	$.event('submit', form, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});
	$.delegated('keydown', input, function (...$$args) {
		$.get(event_handler_1)?.apply(this, $$args);
	});
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['keydown', 'click']);
