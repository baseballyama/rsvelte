import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RecursiveList, toHierarchy } from "carbon-components-svelte";

export default function RecursiveListFlatArray($$anchor, $$props) {
	$.push($$props, true);

	const nodesFlat = [
		{ id: 1, text: "Item 1" },
		{ id: 2, text: "Item 1a", pid: 1 },
		{ id: 3, html: "<h5>HTML content</h5>", pid: 2 },
		{ id: 4, text: "Item 2" },
		{ id: 5, href: "https://svelte.dev/", pid: 4 },
		{
			id: 6,
			href: "https://svelte.dev/",
			text: "Link with custom text",
			pid: 4
		},
		{ id: 7, text: "Item 3" }
	];

	{
		let $0 = $.derived(() => toHierarchy(nodesFlat, (node) => node.pid));

		RecursiveList($$anchor, {
			get nodes() {
				return $.get($0);
			}
		});
	}

	$.pop();
}