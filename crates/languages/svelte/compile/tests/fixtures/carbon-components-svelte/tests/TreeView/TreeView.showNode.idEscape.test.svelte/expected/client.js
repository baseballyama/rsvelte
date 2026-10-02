import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TreeView_showNode_idEscape_test($$anchor) {
	/** Id contains `"`, which breaks a naive `[id="..."]` selector without CSS.escape */
	const targetId = 'node-with-"-char';

	let treeview;

	let nodes = [
		{
			id: "folder",
			text: "Folder",
			nodes: [{ id: targetId, text: "Leaf" }]
		}
	];

	var fragment = root();
	var node_1 = $.first_child(fragment);

	$.bind_this(
		TreeView(node_1, {
			labelText: 'showNode id escape',
			get nodes() {
				return nodes;
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
		'data-testid': 'show-special-id',
		$$events: { click: () => treeview.showNode(targetId) },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Show node with special id');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}