import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RecursiveList } from "carbon-components-svelte";

export default function RecursiveListStableKeys($$anchor) {
	const nodes = [
		{ id: "intro", text: "Introduction" },
		{
			id: "guide",
			text: "Guide",
			nodes: [{ id: "guide-1", text: "Setup" }]
		},
		{ id: "api", text: "API reference" }
	];

	RecursiveList($$anchor, {
		get nodes() {
			return nodes;
		}
	});
}