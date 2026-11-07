import * as $ from 'svelte/internal/server';

export default function _0_typing_snippets_input($$renderer, $$props) {
	let { data, children, row } = $$props;

	$$renderer.push(`<table>`);

	if (children) {
		$$renderer.push(`<!--[0--><thead><tr>`);
		children($$renderer);
		$$renderer.push(`<!----></tr></thead>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--><tbody><!--[-->`);

	const each_array = $.ensure_array_like(data);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let d = each_array[$$index];

		$$renderer.push(`<tr>`);
		row($$renderer, d);
		$$renderer.push(`<!----></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table>`);
}