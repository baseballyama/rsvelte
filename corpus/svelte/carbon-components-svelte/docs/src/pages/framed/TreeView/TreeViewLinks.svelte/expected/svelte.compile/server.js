import * as $ from 'svelte/internal/server';
import { Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewLinks($$renderer) {
	let activeId = "";
	let selectedIds = [];

	let nodes = [
		{
			id: 0,
			text: "IBM Cloud",
			href: "https://cloud.ibm.com",
			target: "_blank"
		},

		{
			id: 1,
			text: "Services",
			nodes: [
				{
					id: 2,
					text: "AI / Machine learning",
					href: "https://cloud.ibm.com/catalog#ai",
					target: "_blank"
				},

				{
					id: 3,
					text: "Analytics",
					href: "https://cloud.ibm.com/catalog#analytics",
					target: "_blank"
				},

				{
					id: 4,
					text: "Databases",
					href: "https://cloud.ibm.com/catalog#databases",
					target: "_blank"
				}
			]
		},

		{
			id: 5,
			text: "Documentation",
			href: "https://cloud.ibm.com/docs",
			target: "_blank"
		},

		{
			id: 6,
			text: "Unavailable",
			href: "https://cloud.ibm.com/unavailable",
			disabled: true
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				TreeView($$renderer, {
					labelText: 'Cloud Resources',
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
					}
				});

				$$renderer.push(`<!----></div> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>Active node id: ${$.escape(activeId)}</div> <div>Selected ids: ${$.escape(JSON.stringify(selectedIds))}</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}