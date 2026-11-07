import * as $ from 'svelte/internal/server';

function test($$renderer, text) {
	$$renderer.push(`<mrow></mrow>`);
}

export default function Wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<mrow></mrow> `);

		if (true) {
			$$renderer.push(`<!--[0--><mrow></mrow>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(Array(2).fill(0));

		for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
			let item = each_array[idx];

			$$renderer.push(`<mrow></mrow>`);
		}

		$$renderer.push(`<!--]--> ${$.html('<mrow></mrow>')} `);
		test($$renderer);
		$$renderer.push(`<!---->`);
	});
}