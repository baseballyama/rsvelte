import * as $ from 'svelte/internal/server';
import { Button, Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewEvents($$renderer) {
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

	Stack($$renderer, {
		gap: 6,
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Expand all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Collapse all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div>`);
			TreeView($$renderer, { multiselect: true, labelText: 'Cloud Products', nodes });
			$$renderer.push(`<!----></div> `);

			if (lastEvent) {
				$$renderer.push('<!--[0-->');

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>Last node event: ${$.escape(lastEvent.type)}</div> <div>Node: ${$.escape(lastEvent.text)} (id: ${$.escape(lastEvent.id)})</div> <div>detail.expanded: ${$.escape(lastEvent.expanded)}</div> <div>detail.selected: ${$.escape(lastEvent.selected)}</div>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (lastToggleChange) {
				$$renderer.push('<!--[0-->');

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>Last toggle:change</div> <div>expandedIds: ${$.escape(JSON.stringify(lastToggleChange.expandedIds))}</div> <div>added: ${$.escape(JSON.stringify(lastToggleChange.added))}</div> <div>removed: ${$.escape(JSON.stringify(lastToggleChange.removed))}</div>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (lastSelectChange) {
				$$renderer.push('<!--[0-->');

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>Last select:change</div> <div>selectedIds: ${$.escape(JSON.stringify(lastSelectChange.selectedIds))}</div> <div>added: ${$.escape(JSON.stringify(lastSelectChange.added))}</div> <div>removed: ${$.escape(JSON.stringify(lastSelectChange.removed))}</div>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}