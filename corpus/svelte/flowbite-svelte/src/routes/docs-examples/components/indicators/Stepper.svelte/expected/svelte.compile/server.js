import * as $ from 'svelte/internal/server';
import { Indicator } from "flowbite-svelte";
import { CheckCircleSolid } from "flowbite-svelte-icons";

export default function Stepper($$renderer) {
	$$renderer.push(`<ol class="flex items-center"><!--[-->`);

	const each_array = $.ensure_array_like([1, 2, 2, 3]);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let step = each_array[i];

		$$renderer.push(`<li class="relative mb-6 w-full"><div class="flex items-center">`);

		Indicator($$renderer, {
			size: 'xl',
			color: i < 3 ? undefined : "gray",
			class: `z-10 shrink-0 ring-0 ring-white sm:ring-8 ${i < 3
				? "bg-primary-200 dark:bg-primary-900"
				: "dark:bg-gray-700 dark:ring-gray-900"}`,

			children: ($$renderer) => {
				if (i === 3) {
					$$renderer.push('<!--[0-->');
					CheckCircleSolid($$renderer, { class: 'h-6 w-6 text-gray-800 dark:text-gray-300' });
				} else {
					$$renderer.push('<!--[-1-->');
					CheckCircleSolid($$renderer, { class: 'text-primary-600 dark:text-primary-300 h-6 w-6' });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (i < 3) {
			$$renderer.push(`<!--[0--><div class="flex h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="mt-3"><h3 class="font-medium text-gray-900 dark:text-white">Step ${$.escape(step)}</h3></div></li>`);
	}

	$$renderer.push(`<!--]--></ol> <ol class="flex items-center"><!--[-->`);

	const each_array_1 = $.ensure_array_like([1, 2, 2, 3]);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let step = each_array_1[i];

		$$renderer.push(`<li class="relative mb-6 w-full"><div class="flex items-center">`);

		Indicator($$renderer, {
			size: 'xl',
			color: i < 3 ? undefined : "gray",
			class: `z-10 shrink-0 ring-0 ring-white sm:ring-8 ${i < 3
				? "bg-primary-200 dark:bg-primary-900"
				: "dark:bg-gray-700 dark:ring-gray-900"}`,

			children: ($$renderer) => {
				Indicator($$renderer, {
					color: i < 3 ? "orange" : "secondary",
					class: i === 3 ? "dark:bg-gray-300!" : ""
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (i < 3) {
			$$renderer.push(`<!--[0--><div class="flex h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="mt-3"><h3 class="font-medium text-gray-900 dark:text-white">Step ${$.escape(step)}</h3></div></li>`);
	}

	$$renderer.push(`<!--]--></ol>`);
}