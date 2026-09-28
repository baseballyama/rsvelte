import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const promise = new Promise(() => {});
		const test = [1, 2, 3];

		$.await(
			$$renderer,
			promise,
			() => {
				$$renderer.push(`<div>waiting</div>`);
			},
			() => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(test);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let t = each_array[$$index];

					$$renderer.push(`<div>t</div>`);
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}