import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RecursiveList, Stack, TreeView } from "carbon-components-svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";

var root = $.from_html(`<span></span> <!>`, 1);
var root_1 = $.from_html(`<div role="none"><!></div>`);
var root_2 = $.from_html(`<div><!></div> <!>`, 1);

export default function TreeViewInlineEditing($$anchor, $$props) {
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			TreeView(node_1, {
				labelText: 'Cloud Products',
				get nodes() {
					return nodes;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const node = $.derived(() => $$slotProps.node);
						var div_1 = root_1();
						var node_2 = $.child(div_1);

						Stack(node_2, {
							orientation: 'horizontal',
							gap: 2,
							tag: 'span',
							style: 'align-items: center; outline: none',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var span = $.first_child(fragment_2);

								$.set_style(span, '', {}, { outline: 'none' });
								$.action(span, ($$node, $$action_arg) => syncContenteditable?.($$node, $$action_arg), () => $.get(node).text);
								$.effect(() => $.event('input', span, (e) => updateNodeText($.get(node).id, e.currentTarget.textContent)));

								var node_3 = $.sibling(span, 2);

								Edit(node_3, { 'aria-hidden': 'true' });
								$.template_effect(() => $.set_attribute(span, 'contenteditable', !$.get(node).disabled));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);

						$.event('click', div_1, $.stopPropagation(function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}));

						$.event('keydown', div_1, $.stopPropagation(function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}));

						$.append($$anchor, div_1);
					}
				}
			});

			$.reset(div);

			var node_4 = $.sibling(div, 2);

			RecursiveList(node_4, {
				get nodes() {
					return nodes;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}