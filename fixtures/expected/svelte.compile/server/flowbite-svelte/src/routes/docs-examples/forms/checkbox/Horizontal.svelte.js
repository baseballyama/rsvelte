import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Horizontal($$renderer) {
	$$renderer.push(`<p class="mb-4 font-semibold text-gray-900 dark:text-white">Identification</p> <ul class="w-full items-center divide-x divide-gray-200 rounded-lg border border-gray-200 sm:flex rtl:divide-x-reverse dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800"><li class="w-full">`);

	Checkbox($$renderer, {
		classes: { div: "p-3" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Svelte`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></li> <li class="w-full">`);

	Checkbox($$renderer, {
		classes: { div: "p-3" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Vue JS`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></li> <li class="w-full">`);

	Checkbox($$renderer, {
		classes: { div: "p-3" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->React`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></li> <li class="w-full">`);

	Checkbox($$renderer, {
		classes: { div: "p-3" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Angular`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></li></ul>`);
}