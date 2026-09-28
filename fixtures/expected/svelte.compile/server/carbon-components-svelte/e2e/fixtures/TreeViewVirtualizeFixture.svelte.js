import * as $ from 'svelte/internal/server';
import { Button, TreeView } from "carbon-components-svelte";

export default function TreeViewVirtualizeFixture($$renderer) {
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
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			size: 'small',
			'data-testid': 'jump-deep',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Jump to a deep file`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TreeView($$renderer, {
			'data-testid': 'tree-view-virtualize',
			labelText: 'Project files',
			nodes,
			virtualize: { containerHeight: 480 },
			get scrollContainerRef() {
				return scrollContainerRef;
			},

			set scrollContainerRef($$value) {
				scrollContainerRef = $$value;
				$$settled = false;
			},

			get expandedIds() {
				return expandedIds;
			},

			set expandedIds($$value) {
				expandedIds = $$value;
				$$settled = false;
			},
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { node }) => {
					$$renderer.push(`<!---->${$.escape(node.text)}`);
				}
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}