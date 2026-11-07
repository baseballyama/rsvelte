import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function TreeView_getNode_test($$anchor) {
	let treeview;
	let selectedIds = [];

	let nodes = [
		{ id: 0, text: "Level 0" },
		{
			id: 1,
			text: "Level 1",
			nodes: [
				{
					id: 2,
					text: "Level 2",
					nodes: [
						{ id: 3, text: "Level 3 - Target" },
						{ id: 4, text: "Level 3 - Other" }
					]
				}
			]
		}
	];

	var fragment = root();
	var node_1 = $.first_child(fragment);

	$.bind_this(
		TreeView(node_1, {
			labelText: 'getNode Test',
			get nodes() {
				return nodes;
			},

			get selectedIds() {
				return selectedIds;
			},

			set selectedIds($$value) {
				selectedIds = $$value;
			},
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const node = $.derived(() => $$slotProps.node);

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(node).text));
					$.append($$anchor, text);
				}
			}
		}),
		($$value) => treeview = $$value,
		() => treeview
	);

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		'data-testid': 'get-node',
		$$events: { click: () => console.log("getNode", treeview.getNode(3)) },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Get node');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		'data-testid': 'get-missing-node',
		$$events: { click: () => console.log("getNode", treeview.getNode(999)) },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Get missing node');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		'data-testid': 'get-nodes',
		$$events: {
			click: () => console.log("getNodes", treeview.getNodes([3, 999, 0]))
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Get nodes');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}