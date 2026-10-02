import * as $ from 'svelte/internal/server';

import { withModifiers, withKeys, renderList, normalizeClass, toDisplayString } from 'vue';

import { ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';

export default function Todo_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function renderable(value_1) {
			return typeof value_1 === 'string' || typeof value_1 === 'number' || typeof value_1 === 'boolean' ? value_1 : undefined;
		}
		let todos = [{ id: 1, text: 'write tests', done: true }];
		let draft = '';
		let next = 2;
		let remaining = $.derived(() => todos.filter((t) => !t.done).length);
		function add() {
			const text = draft.trim();
			if (!text) return;
			todos.push({ id: next++, text, done: false });
			draft = '';
		}
		function clearDone() {
			todos = todos.filter((t) => !t.done);
		}
		$$renderer.push(`<form class="new"><input class="draft" placeholder="What needs doing?"${$.attr('value', renderable(draft))}/><button class="add"${$.attr('disabled', ssrIncludeBooleanAttr(!draft.trim()), true)}>add</button></form><ul class="todos"><!--[-->`);
		const each_array = $.ensure_array_like(renderList(todos, (value_2) => value_2));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let todo = each_array[$$index];
			$$renderer.push(`<li${$.attr_class($.clsx(normalizeClass([{ done: todo.done }])))}><label><input type="checkbox"${$.attr('checked', ssrIncludeBooleanAttr(Array.isArray(todo.done) ? ssrLooseContain(todo.done, null) : todo.done), true)}/> ${$.escape(toDisplayString(todo.text))}</label></li>`);
		}
		$$renderer.push(`<!--]--></ul><p class="summary"><span>${$.escape(toDisplayString(remaining()))}</span> <span>${$.escape(toDisplayString(remaining() === 1 ? 'item' : 'items'))} left</span></p>`);
		if (todos.some((t) => t.done)) {
			$$renderer.push(`<!--[0--><button class="clear">clear done</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}
		$$renderer.push(`<!--]-->`);
	});
}
