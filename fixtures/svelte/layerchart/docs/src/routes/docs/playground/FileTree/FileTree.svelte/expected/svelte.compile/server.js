import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import * as TreeView from './TreeView';

export default function FileTree($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			filePaths,
			selectedFile = '',
			openAllNodes = false,
			alphabetize = true,
			class: className = '',
			onSelect
		} = $$props;

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

			filePaths.forEach((file) => createNode(file, file === selectedFile || openAllNodes));

			return alphabetize ? sortNodes(result) : result;
		});

		function renderNodes($$renderer, nodes) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(nodes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let node = each_array[$$index];

				if (TreeView.Node) {
					$$renderer.push('<!--[-->');

					TreeView.Node($$renderer, {
						name: node.name,
						path: node.path,
						open: node.open,
						selected: !!selectedFile && selectedFile === node.path,
						onSelect: (path) => {
							selectedFile = path;
							onSelect?.(path);
						},

						children: ($$renderer) => {
							renderNodes($$renderer, node.children);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div${$.attr_class($.clsx(cls(className, 'group')))}>`);

		if (TreeView.Root) {
			$$renderer.push('<!--[-->');

			TreeView.Root($$renderer, {
				children: ($$renderer) => {
					renderNodes($$renderer, tree());
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
		$.bind_props($$props, { selectedFile });
	});
}