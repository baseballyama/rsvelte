import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeView } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="mode" style="display:none"> </div> <div data-testid="selected-ids" style="display:none"> </div> <div style="display: flex; gap: 8px; margin-bottom: 16px;"><button type="button" data-testid="set-node">node</button> <button type="button" data-testid="set-shallow">shallow</button> <button type="button" data-testid="set-deep">deep</button></div> <!>`, 1);

export default function TreeViewMultiselectFixture($$anchor) {
	let activeId = 0;
	let selectedIds = [0];
	let expandedIds = [1];
	let multiselect = true;
	let multiselectMode = "node";

	const nodes = [
		{ id: 0, text: "AI / Machine learning" },
		{
			id: 1,
			text: "Analytics",
			nodes: [
				{
					id: 2,
					text: "IBM Analytics Engine",
					nodes: [{ id: 3, text: "Apache Spark" }, { id: 4, text: "Hadoop" }]
				},
				{ id: 5, text: "IBM Cloud SQL Query" },
				{ id: 6, text: "IBM Db2 Warehouse on Cloud" }
			]
		},

		{
			id: 7,
			text: "Blockchain",
			nodes: [{ id: 8, text: "IBM Blockchain Platform" }]
		},

		{
			id: 9,
			text: "Databases",
			nodes: [
				{ id: 10, text: "IBM Cloud Databases for Elasticsearch" },
				{ id: 11, text: "IBM Cloud Databases for Enterprise DB" },
				{ id: 12, text: "IBM Cloud Databases for MongoDB" },
				{ id: 13, text: "IBM Cloud Databases for PostgreSQL" }
			]
		},

		{
			id: 14,
			text: "Integration",
			disabled: true,
			nodes: [{ id: 15, text: "IBM API Connect", disabled: true }]
		}
	];

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var button = $.child(div_2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	TreeView(node, {
		'data-testid': 'tree-view',
		labelText: 'Cloud Products',
		multiselect,
		get multiselectMode() {
			return multiselectMode;
		},

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

	$.template_effect(
		($0) => {
			$.set_text(text, multiselectMode);
			$.set_text(text_1, $0);
		},
		[() => JSON.stringify(selectedIds)]
	);

	$.delegated('click', button, () => multiselectMode = "node");
	$.delegated('click', button_1, () => multiselectMode = "shallow");
	$.delegated('click', button_2, () => multiselectMode = "deep");
	$.append($$anchor, fragment);
}

$.delegate(['click']);