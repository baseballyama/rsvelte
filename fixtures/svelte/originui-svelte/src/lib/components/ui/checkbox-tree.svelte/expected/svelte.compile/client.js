import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';

export default function Checkbox_tree($$anchor, $$props) {
	$.push($$props, true);

	const checkedNodes = new SvelteSet();

	// Initialize checked nodes (Self-invoking function)
	(function initializeCheckedNodes(node) {
		if (node.defaultChecked) {
			checkedNodes.add(node.id);
		}

		node.children?.forEach(initializeCheckedNodes);
	})($$props.tree);

	function isChecked(node) {
		if (!node.children) {
			return checkedNodes.has(node.id);
		}

		const childrenChecked = node.children.map(isChecked);

		if (childrenChecked.every((status) => status === true)) {
			return true;
		}

		return false;
	}

	function isIndeterminate(node) {
		if (!node.children?.length) return false;

		const childrenChecked = node.children.map(isChecked);

		return childrenChecked.some(Boolean) && !childrenChecked.every(Boolean);
	}

	function handleCheck(node) {
		function toggleNode(n, check) {
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

	function renderTreeNode(node) {
		return {
			checked: isChecked(node),
			children: node.children?.map(renderTreeNode) ?? [],
			id: node.id,
			indeterminate: isIndeterminate(node),
			label: node.label,
			onCheckedChange: () => handleCheck(node)
		};
	}

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		let $0 = $.derived(() => renderTreeNode($$props.tree));

		$.snippet(node_1, () => $$props.renderNode, () => $.get($0));
	}

	$.append($$anchor, fragment);
	$.pop();
}