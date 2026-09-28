import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 'bar';
	let value_bound = 'bar';
	let options = {};

	function loadOptions() {
		options = { foo: 'Foo', bar: 'Bar', baz: 'Baz' };
	}

	$$renderer.select({ value }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(options));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [key, value] = each_array[$$index];

			$$renderer.option({ value: key }, ($$renderer) => {
				$$renderer.push(`${$.escape(value)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` `);

	$$renderer.select({ value: value_bound }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(Object.entries(options));

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let [key, value] = each_array_1[$$index_1];

			$$renderer.option({ value: key }, ($$renderer) => {
				$$renderer.push(`${$.escape(value)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` <button>Load options</button>`);
}