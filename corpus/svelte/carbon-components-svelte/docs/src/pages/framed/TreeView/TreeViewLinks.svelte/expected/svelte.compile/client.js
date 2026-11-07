import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<div> </div> <div> </div>`, 1);
var root_1 = $.from_html(`<div><!></div> <!>`, 1);

export default function TreeViewLinks($$anchor) {
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			TreeView(node, {
				labelText: 'Cloud Resources',
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
				$$events: { select: ({ detail }) => console.log("select", detail) }
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			Stack(node_1, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div_1 = $.first_child(fragment_2);
					var text = $.only_child(div_1);
					var div_2 = $.sibling(div_1, 2);
					var text_1 = $.only_child(div_2);

					$.template_effect(
						($0) => {
							$.set_text(text, `Active node id: ${activeId ?? ''}`);
							$.set_text(text_1, `Selected ids: ${$0 ?? ''}`);
						},
						[() => JSON.stringify(selectedIds)]
					);

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}