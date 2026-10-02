import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function TableDefaultRow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, html, rowState } = $$props;

		// export let items: Array<Array<string>>;
		// export let html: boolean = false;
		// export let rowState: "striped" | "hover" | undefined = undefined;
		const category = getContext("category");

		// console.log('category: ', category)
		let trClass = $.derived(() => rowState === "striped"
			? "border-b dark:bg-gray-800 dark:border-gray-700 odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
			: rowState === "hover"
				? "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
				: "bg-white border-b dark:bg-gray-800 dark:border-gray-700");

		let trLastClass = $.derived(() => rowState === "striped"
			? "odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
			: rowState === "hover"
				? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
				: "bg-white dark:bg-gray-800");

		if (category === "props") {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				if (i === items.length - 1) {
					$$renderer.push(`<!--[0--><tr${$.attr_class($.clsx(trLastClass()))}><!--[-->`);

					const each_array_1 = $.ensure_array_like(item);

					for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
						let cell = each_array_1[j];

						if (j === 0) {
							$$renderer.push(`<!--[0--><th scope="row" class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">`);

							if (html) {
								$$renderer.push(`<!--[0-->${$.html(cell)}`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(cell)}`);
							}

							$$renderer.push(`<!--]--></th>`);
						} else {
							$$renderer.push(`<!--[-1--><td class="px-6 py-4">`);

							if (html) {
								$$renderer.push(`<!--[0-->${$.html(cell)}`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(cell)}`);
							}

							$$renderer.push(`<!--]--></td>`);
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></tr>`);
				} else {
					$$renderer.push(`<!--[-1--><tr${$.attr_class($.clsx(trClass()))}><!--[-->`);

					const each_array_2 = $.ensure_array_like(item);

					for (let j = 0, $$length = each_array_2.length; j < $$length; j++) {
						let cell = each_array_2[j];

						if (j === 0) {
							$$renderer.push(`<!--[0--><th scope="row" class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">`);

							if (html) {
								$$renderer.push(`<!--[0-->${$.html(cell)}`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(cell)}`);
							}

							$$renderer.push(`<!--]--></th>`);
						} else {
							$$renderer.push(`<!--[-1--><td class="px-6 py-4">`);

							if (html) {
								$$renderer.push(`<!--[0-->${$.html(cell)}`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(cell)}`);
							}

							$$renderer.push(`<!--]--></td>`);
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></tr>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_3 = $.ensure_array_like(items);

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let tagName = each_array_3[$$index_3];

				$$renderer.push(`<tr${$.attr_class($.clsx(trClass()))}><td class="px-6 py-4">${$.escape(tagName)}</td></tr>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}