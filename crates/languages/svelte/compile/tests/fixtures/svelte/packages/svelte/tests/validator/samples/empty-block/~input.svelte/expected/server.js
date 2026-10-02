import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let things = [];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(things);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!---->`);

	{
		$$renderer.push(`x`);
	}

	$$renderer.push(`<!----> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`${$.escape(things)}`);
		},
		() => {}
	);

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(things);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let thing = each_array_1[$$index_1];
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!---->`);

	{}

	$$renderer.push(`<!----> `);
	$.await($$renderer, promise, () => {}, () => {});
	$$renderer.push(`<!--]-->`);
}