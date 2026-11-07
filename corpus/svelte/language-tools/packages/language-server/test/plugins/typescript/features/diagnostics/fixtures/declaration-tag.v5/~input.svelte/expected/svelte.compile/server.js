import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let boxes = [{ width: 3, height: 4 }, { width: 5, height: 7 }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		const area = box.width * box.height;
		let label = `${area} square pixels`;
		const doubled = area * 2;

		$$renderer.push(`<p>${$.escape(doubled === 1)} ${$.escape(label === 'large')}</p> `);

		{
			const area = 'nested';

			$$renderer.push(`<div>nested</div>`);
		}
	}

	$$renderer.push(`<!--]-->`);
}