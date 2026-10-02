import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	const value = ['a'];

	$$renderer.push(`<div>${$.escape(value[0])} <!--[-->`);

	const each_array = $.ensure_array_like(value);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(n)}`);
	}

	$$renderer.push(`<!--]--></div> <div>`);

	Child($$renderer, {
		value: ['b'],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { value }) => {
				$$renderer.push(`<!---->${$.escape(value[0])}`);
			}
		}
	});

	$$renderer.push(`<!----></div> <div>${$.escape(value[0])} <!--[-->`);

	const each_array_1 = $.ensure_array_like(value);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let n = each_array_1[$$index_1];

		$$renderer.push(`<!---->${$.escape(n)}`);
	}

	$$renderer.push(`<!--]--></div>`);
}