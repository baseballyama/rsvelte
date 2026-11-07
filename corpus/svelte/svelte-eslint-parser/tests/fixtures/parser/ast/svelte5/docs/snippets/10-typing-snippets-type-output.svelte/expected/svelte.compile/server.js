import * as $ from 'svelte/internal/server';

export default function _0_typing_snippets_type_output($$renderer, $$props) {
	// Snippet: Snippet<Parameters>, Snippet: Snippet<Parameters>
	let {
		data,
		children,
		row // data: any[], data: any[], children: Snippet<[]>, children: Snippet<[]>, row: Snippet<[any]>, row: Snippet<[any]>

		// data: any[]
		// children: Snippet<[]>, Snippet: Snippet<Parameters>
		// row: Snippet<[any]>, Snippet: Snippet<Parameters>
	} = $$props; // $props(): { data: any[]; children: Snippet<[]>; row: Snippet<[any]>; }

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