import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

export default function Todo_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let todo = '';
		let todos = [];
		let filter = 'all';
		let filteredTodos = $.derived(filterTodos);
		let remaining = $.derived(remainingTodos);

		function addTodo(e) {
			e.preventDefault();
			todos.push({ id: crypto.randomUUID(), text: todo, completed: false });
			todo = '';
		}

		function removeTodo(todo) {
			todos = todos.filter((t) => t.id !== todo.id);
		}

		function filterTodos() {
			return todos.filter((todo) => {
				if (filter === 'all') return true;
				if (filter === 'active') return !todo.completed;
				if (filter === 'completed') return todo.completed;
			});
		}

		function setFilter(newFilter) {
			filter = newFilter;
		}

		function remainingTodos() {
			return todos.filter((todo) => !todo.completed).length;
		}

		function clearCompleted() {
			todos = todos.filter((todo) => !todo.completed);
		}

		$$renderer.push(`<div class="container svelte-15bpv6s"><form><input type="text"${$.attr('value', todo)} placeholder="Add todo" class="svelte-15bpv6s"/></form> <ul class="svelte-15bpv6s"><!--[-->`);

		const each_array = $.ensure_array_like(filteredTodos());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let todo = each_array[$$index];

			$$renderer.push(`<li class="svelte-15bpv6s"><input type="checkbox"${$.attr('checked', todo.completed, true)} class="svelte-15bpv6s"/> <input type="text"${$.attr('value', todo.text)} class="svelte-15bpv6s"/> <button>🗙</button></li>`);
		}

		$$renderer.push(`<!--]--></ul> <div><p>${$.escape(remaining())} ${$.escape(remaining() === 1 ? 'item' : 'items')} left</p> <!--[-->`);

		const each_array_1 = $.ensure_array_like(['all', 'active', 'completed']);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let filter = each_array_1[$$index_1];

			$$renderer.push(`<button>${$.escape(filter)}</button>`);
		}

		$$renderer.push(`<!--]--> <button>Clear completed</button></div></div>`);
	});
}