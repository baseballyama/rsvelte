import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let available = [1, 2, 3, 4, 5];
	let taken = [2, 4];

	$$renderer.push(`<select>`);

	$$renderer.option({ value: 'please choose' }, ($$renderer) => {
		$$renderer.push(`please choose`);
	});

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(available);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let a = each_array[$$index];

		$$renderer.option({ disabled: !!taken.find((f) => f == a), value: a }, ($$renderer) => {
			$$renderer.push(`${$.escape(a)}`);
		});
	}

	$$renderer.push(`<!--]--></select>`);
}