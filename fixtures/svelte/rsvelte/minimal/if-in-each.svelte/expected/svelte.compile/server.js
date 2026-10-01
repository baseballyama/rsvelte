import * as $ from 'svelte/internal/server';

export default function If_in_each($$renderer) {
	let tasks = [{ text: 'write', done: true }, { text: 'test', done: false }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(tasks);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let task = each_array[$$index];

		if (task.done) {
			$$renderer.push(`<!--[0--><s>${$.escape(task.text)}</s>`);
		} else {
			$$renderer.push(`<!--[-1--><b>${$.escape(task.text)}</b>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}