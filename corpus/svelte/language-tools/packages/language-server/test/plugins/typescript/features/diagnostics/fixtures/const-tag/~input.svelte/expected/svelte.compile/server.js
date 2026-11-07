import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const promise = Promise.resolve({ foo: true });
	const shadowed = true;

	shadowed;

	$.await($$renderer, promise, () => {}, (result) => {
		const bar = result;
		const str = "hello";
		const shadowed = "shadowed";

		$$renderer.push(`${$.escape(bar === result)}
    true
    true`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like([1, 2]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		const x = item * 2;
		const shadowed = item * 3;

		$$renderer.push(`<!---->${$.escape(x === shadowed)}`);
	}

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, promise, () => {}, (result) => {
		const unused = doesntExist;
		const str = "hello";

		$$renderer.push(`false`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like([1, 2]);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];
		const unused = doesntExist;
		const x = item * 2;

		$$renderer.push(`<!---->${$.escape(x === "asd")}`);
	}

	$$renderer.push(`<!--]-->`);
}