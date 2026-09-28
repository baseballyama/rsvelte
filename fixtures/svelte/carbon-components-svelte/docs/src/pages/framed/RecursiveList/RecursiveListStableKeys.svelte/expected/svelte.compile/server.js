import * as $ from 'svelte/internal/server';
import { RecursiveList } from "carbon-components-svelte";

export default function RecursiveListStableKeys($$renderer) {
	const nodes = [
		{ id: "intro", text: "Introduction" },
		{
			id: "guide",
			text: "Guide",
			nodes: [{ id: "guide-1", text: "Setup" }]
		},
		{ id: "api", text: "API reference" }
	];

	RecursiveList($$renderer, { nodes });
}