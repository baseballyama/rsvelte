import * as $ from 'svelte/internal/server';
import { TreeView } from "carbon-components-svelte";

export default function TreeViewFixture($$renderer) {
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TreeView($$renderer, {
			'data-testid': 'tree-view',
			labelText: 'Tree',
			nodes,
			get activeId() {
				return activeId;
			},

			set activeId($$value) {
				activeId = $$value;
				$$settled = false;
			},

			get selectedIds() {
				return selectedIds;
			},

			set selectedIds($$value) {
				selectedIds = $$value;
				$$settled = false;
			},

			get expandedIds() {
				return expandedIds;
			},

			set expandedIds($$value) {
				expandedIds = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}