import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let promise = getNumbers();
		let selected = 2;

		async function getNumbers() {
			await new Promise((resolve) => setTimeout(resolve, 100));

			return [1, 2, 3];
		}

		$$renderer.select({ value: selected }, ($$renderer) => {
			$.await(
				$$renderer,
				promise,
				() => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`-1`);
					});
				},
				(numbers) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(numbers);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let number = each_array[$$index];

						$$renderer.option({}, number);
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`<!--]-->`);
		});
	});
}