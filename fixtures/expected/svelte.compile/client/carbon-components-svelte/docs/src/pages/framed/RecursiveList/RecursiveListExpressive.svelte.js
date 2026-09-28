import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RecursiveList } from "carbon-components-svelte";

export default function RecursiveListExpressive($$anchor) {
	const nodes = [
		{
			text: "Item 1",
			nodes: [{ text: "Item 1a", nodes: [{ text: "Item 1a-i" }] }]
		},
		{ text: "Item 2", nodes: [{ text: "Item 2a" }] },
		{ text: "Item 3" }
	];

	RecursiveList($$anchor, {
		expressive: true,
		get nodes() {
			return nodes;
		}
	});
}