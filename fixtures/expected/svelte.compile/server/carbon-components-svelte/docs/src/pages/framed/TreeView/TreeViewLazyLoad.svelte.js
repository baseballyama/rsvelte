import * as $ from 'svelte/internal/server';
import { InlineLoading, TreeView } from "carbon-components-svelte";

export default function TreeViewLazyLoad($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let nodes = [
			{ id: "ai", text: "AI / Machine learning", hasChildren: true },
			{ id: "analytics", text: "Analytics", hasChildren: true },
			{ id: "blockchain", text: "Blockchain", hasChildren: true }
		];

		const childrenByParentId = {
			ai: [
				{ id: "watson-studio", text: "Watson Studio" },
				{ id: "watson-assistant", text: "Watson Assistant" }
			],
			analytics: [
				{ id: "analytics-engine", text: "IBM Analytics Engine" },
				{ id: "cloud-sql-query", text: "IBM Cloud SQL Query" }
			],
			blockchain: [
				{ id: "blockchain-platform", text: "IBM Blockchain Platform" }
			]
		};

		function fetchChildren(id) {
			return new Promise((resolve) => {
				setTimeout(() => resolve(childrenByParentId[id] ?? []), 1000);
			});
		}

		async function handleToggle(event) {
			const node = event.detail;

			// Only fetch once: a node with `hasChildren` but no `nodes` yet.
			if (!node.hasChildren || node.nodes) return;

			const children = await fetchChildren(node.id);

			nodes = nodes.map((n) => n.id === node.id ? { ...n, nodes: children } : n);
		}

		TreeView($$renderer, {
			labelText: 'Cloud Products (lazy-loaded)',
			nodes,
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { node }) => {
					$$renderer.push(`<!---->${$.escape(node.text)}`);
				},

				childNodes: ($$renderer, { node }) => {
					{
						InlineLoading($$renderer, {
							status: 'active',
							description: `Loading ${$.stringify(node.text)}…`
						});
					}
				}
			}
		});
	});
}