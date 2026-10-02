import * as $ from 'svelte/internal/server';
import Component, { ListItem } from "./lib/Component.svelte";

export default function Ts_let01_sveltev4_type_output($$renderer) {
	// Component: typeof SvelteComponent, ListItem: any, ListItem: any
	const items = [
		// items: ListItem[]
		{
			title: "Svelte.dev", // title: string
			link: "https://svelte.dev" // link: string
		},

		{
			title: "TypeScript ESLint", // title: string
			link: "https://typescript-eslint.io" // link: string
		},

		{
			title: "TypeScript", // title: string
			link: "https://www.typescriptlang.org" // link: string
		}
	];

	$$renderer.push(`<main>`);

	Component($$renderer, {
		items,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { item }) => {
				$$renderer.push(`<div>${$.escape(item.title)}</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		items,
		children: ($$renderer) => {
			$$renderer.push(`<div>${$.escape(item.title)}</div>`);
		},

		$$slots: {
			default: true,
			count: ($$renderer, { count: foo }) => {
				$$renderer.push(`<span slot="count">${$.escape(foo)}</span>`);
			}
		}
	});

	$$renderer.push(`<!----></main>`);
}