import * as $ from 'svelte/internal/server';
import { ThemeProvider, Heading, P, Card } from "flowbite-svelte";

export default function Theme1($$renderer) {
	const theme1a = {
		card: { base: "bg-blue-50 border-blue-200 p-4" },
		heading: "text-3xl text-blue-500",
		p: "text-blue-500 text-lg"
	};

	const theme1b = { heading: "text-lg text-purple-600 font-bold" };
	const theme1c = { paragraph: "text-gray-600 italic text-md" };

	ThemeProvider($$renderer, {
		theme: theme1a,
		children: ($$renderer) => {
			Heading($$renderer, {
				tag: 'h1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Blue Heading`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Card example`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				href: '/cards',
				children: ($$renderer) => {
					ThemeProvider($$renderer, {
						theme: theme1b,
						children: ($$renderer) => {
							Heading($$renderer, {
								tag: 'h2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Purple Heading`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Heading($$renderer, {
								tag: 'h3',
								class: 'text-green-400',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Green heading`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ThemeProvider($$renderer, {
						theme: theme1c,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}