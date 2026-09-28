import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TreeViewVirtualizeFixture($$anchor) {
	let nextId = 0;
	const id = () => nextId++;

	/** Leaf at the deepest level, used as a `showNode` target. */
	let deepFile = null;

	function makeFolder(name, depth, fanout) {
		const node = { id: id(), text: name, nodes: [] };

		for (let i = 0; i < fanout.files; i++) {
			const file = { id: id(), text: `${name}/file-${i}` };

			node.nodes.push(file);

			if (depth === fanout.maxDepth) deepFile = file.id;
		}

		if (depth < fanout.maxDepth) {
			for (let i = 0; i < fanout.folders; i++) {
				node.nodes.push(makeFolder(`${name}/sub-${i}`, depth + 1, fanout));
			}
		}

		return node;
	}

	const nodes = Array.from({ length: 40 }, (_, i) => makeFolder(`root-${i}`, 0, { files: 8, folders: 4, maxDepth: 4 }));
	let treeview = null;
	let expandedIds = [];
	let scrollContainerRef = null;
	var fragment = root();
	var node_1 = $.first_child(fragment);

	Button(node_1, {
		size: 'small',
		'data-testid': 'jump-deep',
		$$events: { click: () => treeview?.showNode(deepFile) },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Jump to a deep file');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.bind_this(
		TreeView(node_2, {
			'data-testid': 'tree-view-virtualize',
			labelText: 'Project files',
			get nodes() {
				return nodes;
			},
			virtualize: { containerHeight: 480 },
			get scrollContainerRef() {
				return scrollContainerRef;
			},

			set scrollContainerRef($$value) {
				scrollContainerRef = $$value;
			},

			get expandedIds() {
				return expandedIds;
			},

			set expandedIds($$value) {
				expandedIds = $$value;
			},
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
		}),
		($$value) => treeview = $$value,
		() => treeview
	);

	$.append($$anchor, fragment);
}