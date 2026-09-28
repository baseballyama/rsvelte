import * as $ from 'svelte/internal/server';
import { Heading, P, A } from "flowbite-svelte";
import { ChevronRightOutline } from "flowbite-svelte-icons";

export default function SecondLevel($$renderer) {
	Heading($$renderer, {
		tag: 'h2',
		class: 'text-4xl font-extrabold ',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Payments tool for companies`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'my-4 text-gray-500',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Start developing with an open-source library of over 450+ UI components, sections, and pages built with the utility classes from Tailwind CSS and designed in Figma.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'mb-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions. Accelerate critical development work, eliminate toil, and deploy changes with ease.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	A($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Read more `);
			ChevronRightOutline($$renderer, { class: 'ms-2 h-3.5 w-3.5' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}