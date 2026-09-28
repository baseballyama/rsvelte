import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import * as TreeView from './TreeView';

var root = $.from_html(`<div><!></div>`);

export default function FileTree($$anchor, $$props) {
	$.push($$props, true);

	let selectedFile = $.prop($$props, 'selectedFile', 15, ''),
		openAllNodes = $.prop($$props, 'openAllNodes', 3, false),
		alphabetize = $.prop($$props, 'alphabetize', 3, true),
		className = $.prop($$props, 'class', 3, '');

	function sortNodes(nodes) {
		nodes.sort((a, b) => {
			const aIsFolder = a.children.length > 0;
			const bIsFolder = b.children.length > 0;

			if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

			return a.name.localeCompare(b.name);
		});

		nodes.forEach((node) => sortNodes(node.children));

		return nodes;
	}

	let tree = $.derived(() => {
		const result = [];

		function createNode(filePath, isOpen = false) {
			const parts = filePath.split('/');
			let currentLevel = result;
			let currentPath = '';

			parts.forEach((part, i) => {
				currentPath = currentPath ? `${currentPath}/${part}` : part;

				const isLastPart = i === parts.length - 1;
				let existingNode = currentLevel.find((node) => node.name === part);

				if (!existingNode) {
					const newNode = {
						name: part,
						path: currentPath,
						open: isOpen && !isLastPart,
						children: []
					};

					currentLevel.push(newNode);
					existingNode = newNode;
				} else if (isOpen && !isLastPart) {
					existingNode.open = true;
				}

				currentLevel = existingNode.children;
			});
		}

		$$props.filePaths.forEach((file) => createNode(file, file === selectedFile() || openAllNodes()));

		return alphabetize() ? sortNodes(result) : result;
	});

	var div = root();

	{
		const renderNodes = ($$anchor, nodes = $.noop) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, nodes, (node) => node.path, ($$anchor, node) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => !!selectedFile() && selectedFile() === $.get(node).path);

					$.component(node_2, () => TreeView.Node, ($$anchor, TreeView_Node) => {
						TreeView_Node($$anchor, {
							get name() {
								return $.get(node).name;
							},

							get path() {
								return $.get(node).path;
							},

							get open() {
								return $.get(node).open;
							},

							get selected() {
								return $.get($0);
							},

							onSelect: (path) => {
								selectedFile(path);
								$$props.onSelect?.(path);
							},

							children: ($$anchor, $$slotProps) => {
								renderNodes($$anchor, () => $.get(node).children);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		var node_3 = $.child(div);

		$.component(node_3, () => TreeView.Root, ($$anchor, TreeView_Root) => {
			TreeView_Root($$anchor, {
				children: ($$anchor, $$slotProps) => {
					renderNodes($$anchor, () => $.get(tree));
				},
				$$slots: { default: true }
			});
		});

		$.reset(div);
	}

	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cls(className(), 'group'))]);
	$.append($$anchor, div);
	$.pop();
}