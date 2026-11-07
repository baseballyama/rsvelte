import * as $ from 'svelte/internal/server';
import { Blockquote, P } from "flowbite-svelte";

export default function Solid($$renderer) {
	P($$renderer, {
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Does your user know how to exit out of screens? Can they follow your intended user journey and buy something from the site you’ve designed? By running a usability test, you’ll be able to see how
  users will interact with your design once it’s live.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Blockquote($$renderer, {
		border: true,
		bg: true,
		class: 'my-4 p-4',
		children: ($$renderer) => {
			P($$renderer, {
				size: 'xl',
				height: 'relaxed',
				children: ($$renderer) => {
					$$renderer.push(`<!---->"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->First of all you need to understand how Flowbite works. This library is not another framework. Rather, it is a set of components based on Tailwind CSS that you can just copy-paste from the
  documentation.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}