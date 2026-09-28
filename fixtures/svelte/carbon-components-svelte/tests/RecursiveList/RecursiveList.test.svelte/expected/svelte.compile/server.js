import * as $ from 'svelte/internal/server';
import RecursiveList from "carbon-components-svelte/RecursiveList/RecursiveList.svelte";

export default function RecursiveList_test($$renderer) {
	const nodes = [
		{
			text: "Item 1",
			nodes: [
				{ text: "Item 1a", nodes: [{ html: "<h5>HTML content</h5>" }] }
			]
		},

		{
			text: "Item 2",
			nodes: [
				{ href: "https://svelte.dev/" },
				{ href: "https://svelte.dev/", text: "Link with custom text" },
				{
					href: "https://svelte.dev/",
					text: "External link",
					target: "_blank"
				},

				{
					href: "https://svelte.dev/",
					text: "External link with custom rel",
					target: "_blank",
					rel: "noopener"
				}
			]
		},
		{ text: "Item 3" }
	];

	RecursiveList($$renderer, { type: 'ordered', nodes });
}