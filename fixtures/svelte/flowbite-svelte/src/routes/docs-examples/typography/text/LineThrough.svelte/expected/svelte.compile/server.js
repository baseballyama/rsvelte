import * as $ from 'svelte/internal/server';
import { Span } from "flowbite-svelte";

export default function LineThrough($$renderer) {
	Span($$renderer, {
		class: 'line-through',
		children: ($$renderer) => {
			$$renderer.push(`<!---->$109`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);

	Span($$renderer, {
		class: 'ms-3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->$79`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}