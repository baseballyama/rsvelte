import * as $ from "svelte/internal/server";
export default function Actions_two($$renderer) {
	function first(node) {
		node.focus();
	}
	function second(node, value) {
		node.tabIndex = value;
	}
	$$renderer.push(`<input/> <input/>`);
}
