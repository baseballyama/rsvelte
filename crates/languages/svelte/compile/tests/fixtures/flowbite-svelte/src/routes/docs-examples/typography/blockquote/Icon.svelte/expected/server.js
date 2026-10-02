import * as $ from 'svelte/internal/server';
import { Blockquote } from "flowbite-svelte";
import { QuoteSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Blockquote($$renderer, {
		size: 'xl',
		children: ($$renderer) => {
			QuoteSolid($$renderer, { class: 'h-10 w-10 text-gray-400 dark:text-gray-600' });
			$$renderer.push(`<!----> "Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."`);
		},
		$$slots: { default: true }
	});
}