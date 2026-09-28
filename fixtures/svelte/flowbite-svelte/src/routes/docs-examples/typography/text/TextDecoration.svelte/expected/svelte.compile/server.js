import * as $ from 'svelte/internal/server';
import { P, Span } from "flowbite-svelte";

export default function TextDecoration($$renderer) {
	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. `);

			Span($$renderer, {
				underline: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link issues across Jira`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> and ingest data from other `);

			Span($$renderer, {
				underline: true,
				class: 'decoration-blue-500 decoration-double',
				children: ($$renderer) => {
					$$renderer.push(`<!---->software development`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> tools, so your IT support and operations teams have richer contextual information to rapidly respond to `);

			Span($$renderer, {
				underline: true,
				class: 'decoration-green-500 decoration-dotted',
				children: ($$renderer) => {
					$$renderer.push(`<!---->requests`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->, `);

			Span($$renderer, {
				underline: true,
				class: 'decoration-red-500 decoration-dashed decoration-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->incidents`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->, and `);

			Span($$renderer, {
				underline: true,
				class: 'decoration-sky-500 decoration-wavy',
				children: ($$renderer) => {
					$$renderer.push(`<!---->changes`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

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

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->The crypto `);

			Span($$renderer, {
				class: 'uppercase',
				children: ($$renderer) => {
					$$renderer.push(`<!---->identity`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> primitive.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}