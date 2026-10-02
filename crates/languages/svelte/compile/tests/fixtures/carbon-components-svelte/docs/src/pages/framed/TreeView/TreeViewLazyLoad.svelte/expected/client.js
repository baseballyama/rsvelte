import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InlineLoading, TreeView } from "carbon-components-svelte";

export default function TreeViewLazyLoad($$anchor, $$props) {
	$.push($$props, true);

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

	TreeView($$anchor, {
		labelText: 'Cloud Products (lazy-loaded)',
		get nodes() {
			return nodes;
		},
		$$events: { toggle: handleToggle },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const node = $.derived(() => $$slotProps.node);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(node).text));
				$.append($$anchor, text);
			},

			childNodes: ($$anchor, $$slotProps) => {
				const node = $.derived(() => $$slotProps.node);

				InlineLoading($$anchor, {
					status: 'active',
					get description() {
						return `Loading ${$.get(node).text ?? ''}…`;
					}
				});
			}
		}
	});

	$.pop();
}