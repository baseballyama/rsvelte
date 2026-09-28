import * as $ from 'svelte/internal/server';
import { Blockquote } from "flowbite-svelte";

export default function Small($$renderer) {
	Blockquote($$renderer, {
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."`);
		},
		$$slots: { default: true }
	});
}