import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p><!--[-->`);

	const each_array = $.ensure_array_like(['space', ' ', 'between']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let word = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(word)}`);
	}

	$$renderer.push(`<!--]--></p>`);
}