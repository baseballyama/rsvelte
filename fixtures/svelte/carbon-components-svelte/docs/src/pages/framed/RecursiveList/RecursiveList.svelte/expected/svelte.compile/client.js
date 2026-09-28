import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RecursiveList } from "carbon-components-svelte";

export default function RecursiveList_1($$anchor) {
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
				{ href: "https://svelte.dev/", text: "Link with custom text" }
			]
		},
		{ text: "Item 3" }
	];

	RecursiveList($$anchor, {
		get nodes() {
			return nodes;
		}
	});
}