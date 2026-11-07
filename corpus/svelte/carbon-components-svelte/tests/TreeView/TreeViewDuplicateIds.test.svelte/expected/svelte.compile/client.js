import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TreeViewDuplicateIds_test($$anchor) {
	const nodes = [
		{
			id: 0,
			text: "Parent",
			nodes: [{ id: 1, text: "Child A" }, { id: 2, text: "Child B" }]
		}
	];

	var fragment = root();
	var node_1 = $.first_child(fragment);

	TreeView(node_1, {
		labelText: 'First',
		get nodes() {
			return nodes;
		},
		expandedIds: [0],
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
	});

	var node_2 = $.sibling(node_1, 2);

	TreeView(node_2, {
		labelText: 'Second',
		get nodes() {
			return nodes;
		},
		expandedIds: [0],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const node = $.derived(() => $$slotProps.node);

				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(node).text));
				$.append($$anchor, text_1);
			}
		}
	});

	$.append($$anchor, fragment);
}