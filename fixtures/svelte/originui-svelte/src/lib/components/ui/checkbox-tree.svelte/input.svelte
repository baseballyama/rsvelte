<script lang="ts" module>
	/**
	 * IMPORTANT: This component was built for demo purposes only and has not been tested in production.
	 * It serves as a proof of concept for a checkbox tree implementation.
	 * If you're interested in collaborating to create a more robust, production-ready
	 * headless component, your contributions are welcome!
	 */

	export interface TreeNode {
		children?: TreeNode[];
		defaultChecked?: boolean;
		id: string;
		indeterminate?: boolean;
		label: string;
	}

	export interface RenderNodeProps {
		checked: boolean;
		children: RenderNodeProps[];
		id: string;
		indeterminate?: boolean;
		label: string;
		onCheckedChange: () => void;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { SvelteSet } from 'svelte/reactivity';

	let {
		renderNode,
		tree
	}: {
		renderNode: Snippet<[RenderNodeProps]>;
		tree: TreeNode;
	} = $props();

	const checkedNodes = new SvelteSet<string>();

	// Initialize checked nodes (Self-invoking function)
	(function initializeCheckedNodes(node: TreeNode) {
		if (node.defaultChecked) {
			checkedNodes.add(node.id);
		}
		node.children?.forEach(initializeCheckedNodes);
	})(tree);

	function isChecked(node: TreeNode): boolean {
		if (!node.children) {
			return checkedNodes.has(node.id);
		}

		const childrenChecked = node.children.map(isChecked);
		if (childrenChecked.every((status) => status === true)) {
			return true;
		}

		return false;
	}

	function isIndeterminate(node: TreeNode): boolean {
		if (!node.children?.length) return false;

		const childrenChecked = node.children.map(isChecked);
		return childrenChecked.some(Boolean) && !childrenChecked.every(Boolean);
	}

	function handleCheck(node: TreeNode) {
		function toggleNode(n: TreeNode, check: boolean) {
			if (check) {
				checkedNodes.add(n.id);
			} else {
				checkedNodes.delete(n.id);
			}
			n.children?.forEach((child) => toggleNode(child, check));
		}

		const currentStatus = isChecked(node);
		const newCheck = currentStatus !== true;

		toggleNode(node, newCheck);
	}

	function renderTreeNode(node: TreeNode): RenderNodeProps {
		return {
			checked: isChecked(node),
			children: node.children?.map(renderTreeNode) ?? [],
			id: node.id,
			indeterminate: isIndeterminate(node),
			label: node.label,
			onCheckedChange: () => handleCheck(node)
		};
	}
</script>

{@render renderNode(renderTreeNode(tree))}
