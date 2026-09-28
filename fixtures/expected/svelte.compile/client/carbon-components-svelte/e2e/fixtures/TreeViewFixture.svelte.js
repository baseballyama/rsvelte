import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeView } from "carbon-components-svelte";

export default function TreeViewFixture($$anchor) {
	let activeId = "";
	let selectedIds = [];
	let expandedIds = [];

	const nodes = [
		{
			id: "1",
			text: "Parent 1",
			nodes: [{ id: "1-1", text: "Child 1-1" }]
		},

		{
			id: "2",
			text: "Parent 2",
			nodes: [{ id: "2-1", text: "Child 2-1" }]
		}
	];

	TreeView($$anchor, {
		'data-testid': 'tree-view',
		labelText: 'Tree',
		get nodes() {
			return nodes;
		},

		get activeId() {
			return activeId;
		},

		set activeId($$value) {
			activeId = $$value;
		},

		get selectedIds() {
			return selectedIds;
		},

		set selectedIds($$value) {
			selectedIds = $$value;
		},

		get expandedIds() {
			return expandedIds;
		},

		set expandedIds($$value) {
			expandedIds = $$value;
		}
	});
}