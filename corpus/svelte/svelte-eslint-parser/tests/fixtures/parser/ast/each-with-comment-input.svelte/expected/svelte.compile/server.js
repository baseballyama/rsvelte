import * as $ from 'svelte/internal/server';
import Foo from './foo.svelte';

export default function Each_with_comment_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(Array());

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let i = each_array[$$index];

		Foo($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(i)}`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]-->`);
}