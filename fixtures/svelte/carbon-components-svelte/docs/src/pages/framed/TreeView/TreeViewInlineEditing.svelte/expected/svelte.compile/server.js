import * as $ from 'svelte/internal/server';
import { RecursiveList, Stack, TreeView } from "carbon-components-svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";

export default function TreeViewInlineEditing($$renderer) {
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
		},

		{
			id: 9,
			text: "Databases",
			nodes: [
				{ id: 10, text: "IBM Cloud Databases for Elasticsearch" },
				{ id: 11, text: "IBM Cloud Databases for MongoDB" }
			]
		}
	];

	function updateNodeText(id, text) {
		const findAndUpdate = (items) => {
			for (const item of items) {
				if (item.id === id) {
					item.text = text;

					return true;
				}

				if (item.nodes && findAndUpdate(item.nodes)) {
					return true;
				}
			}

			return false;
		};

		findAndUpdate(nodes);
		nodes = nodes;
	}

	function syncContenteditable(element, text) {
		element.textContent = text;

		return {
			update(text) {
				if (document.activeElement !== element) {
					element.textContent = text;
				}
			}
		};
	}

	Stack($$renderer, {
		gap: 6,
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			TreeView($$renderer, {
				labelText: 'Cloud Products',
				nodes,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { node }) => {
						$$renderer.push(`<div role="none">`);

						Stack($$renderer, {
							orientation: 'horizontal',
							gap: 2,
							tag: 'span',
							style: 'align-items: center; outline: none',
							children: ($$renderer) => {
								$$renderer.push(`<span${$.attr('contenteditable', !node.disabled)}${$.attr_style('', { outline: 'none' })}></span> `);
								Edit($$renderer, { 'aria-hidden': 'true' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----></div> `);
			RecursiveList($$renderer, { nodes });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}