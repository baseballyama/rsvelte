import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function TextColor($$renderer) {
	P($$renderer, {
		class: 'text-blue-700 dark:text-blue-500',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This text is in the blue color.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'text-green-700 dark:text-green-500',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This text is in the green color.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'text-red-700 dark:text-red-500',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This text is in the red color.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'text-purple-700 dark:text-purple-500',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This text is in the purple color.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'text-teal-700 dark:text-teal-500',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This text is in the teal color.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}