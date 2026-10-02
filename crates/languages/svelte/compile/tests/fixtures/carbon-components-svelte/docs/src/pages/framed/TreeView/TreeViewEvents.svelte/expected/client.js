import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<div> </div> <div> </div> <div> </div> <div> </div>`, 1);
var root_1 = $.from_html(`<div>Last toggle:change</div> <div> </div> <div> </div> <div> </div>`, 1);
var root_2 = $.from_html(`<div>Last select:change</div> <div> </div> <div> </div> <div> </div>`, 1);
var root_3 = $.from_html(`<div><!> <!></div> <div><!></div> <!> <!> <!>`, 1);

export default function TreeViewEvents($$anchor) {
	let treeview = null;
	let lastEvent = null;
	let lastToggleChange = null;
	let lastSelectChange = null;

	let nodes = [
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
		}
	];

	function logEvent(type, detail) {
		lastEvent = {
			type,
			id: detail.id,
			text: detail.text,
			expanded: detail.expanded,
			selected: detail.selected
		};
	}

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Button(node, {
				$$events: { click: () => treeview?.expandAll() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Expand all');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				kind: 'secondary',
				$$events: { click: () => treeview?.collapseAll() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Collapse all');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			$.bind_this(
				TreeView(node_2, {
					multiselect: true,
					labelText: 'Cloud Products',
					get nodes() {
						return nodes;
					},

					$$events: {
						select: ({ detail }) => logEvent("select", detail),
						toggle: ({ detail }) => logEvent("toggle", detail),
						focus: ({ detail }) => logEvent("focus", detail),
						'toggle:change': ({ detail }) => lastToggleChange = detail,
						'select:change': ({ detail }) => lastSelectChange = detail
					}
				}),
				($$value) => treeview = $$value,
				() => treeview
			);

			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent = ($$anchor) => {
					Stack($$anchor, {
						gap: 4,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var div_2 = $.first_child(fragment_3);
							var text_2 = $.only_child(div_2);
							var div_3 = $.sibling(div_2, 2);
							var text_3 = $.only_child(div_3);
							var div_4 = $.sibling(div_3, 2);
							var text_4 = $.only_child(div_4);
							var div_5 = $.sibling(div_4, 2);
							var text_5 = $.only_child(div_5);

							$.template_effect(() => {
								$.set_text(text_2, `Last node event: ${lastEvent.type ?? ''}`);
								$.set_text(text_3, `Node: ${lastEvent.text ?? ''} (id: ${lastEvent.id ?? ''})`);
								$.set_text(text_4, `detail.expanded: ${lastEvent.expanded ?? ''}`);
								$.set_text(text_5, `detail.selected: ${lastEvent.selected ?? ''}`);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if (lastEvent) $$render(consequent);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					Stack($$anchor, {
						gap: 4,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var div_6 = $.sibling($.first_child(fragment_5), 2);
							var text_6 = $.only_child(div_6);
							var div_7 = $.sibling(div_6, 2);
							var text_7 = $.only_child(div_7);
							var div_8 = $.sibling(div_7, 2);
							var text_8 = $.only_child(div_8);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_6, `expandedIds: ${$0 ?? ''}`);
									$.set_text(text_7, `added: ${$1 ?? ''}`);
									$.set_text(text_8, `removed: ${$2 ?? ''}`);
								},
								[
									() => JSON.stringify(lastToggleChange.expandedIds),
									() => JSON.stringify(lastToggleChange.added),
									() => JSON.stringify(lastToggleChange.removed)
								]
							);

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_4, ($$render) => {
					if (lastToggleChange) $$render(consequent_1);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_2 = ($$anchor) => {
					Stack($$anchor, {
						gap: 4,
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_2();
							var div_9 = $.sibling($.first_child(fragment_7), 2);
							var text_9 = $.only_child(div_9);
							var div_10 = $.sibling(div_9, 2);
							var text_10 = $.only_child(div_10);
							var div_11 = $.sibling(div_10, 2);
							var text_11 = $.only_child(div_11);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_9, `selectedIds: ${$0 ?? ''}`);
									$.set_text(text_10, `added: ${$1 ?? ''}`);
									$.set_text(text_11, `removed: ${$2 ?? ''}`);
								},
								[
									() => JSON.stringify(lastSelectChange.selectedIds),
									() => JSON.stringify(lastSelectChange.added),
									() => JSON.stringify(lastSelectChange.removed)
								]
							);

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_5, ($$render) => {
					if (lastSelectChange) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}