import * as $ from 'svelte/internal/server';
import Component, { ListItem } from "./lib/Component.svelte";

export default function Ts_let01_input($$renderer) {
	const items = [
		{ title: "Svelte.dev", link: "https://svelte.dev" },
		{
			title: "TypeScript ESLint",
			link: "https://typescript-eslint.io"
		},
		{ title: "TypeScript", link: "https://www.typescriptlang.org" }
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