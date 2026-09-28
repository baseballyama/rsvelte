import * as $ from 'svelte/internal/server';

export default function Draggable($$renderer, $$props) {
	let { children, handle, // query
	 close, onclose } = $$props;
	let left = 0;
	let top = 0;
	let moving = false;

	function onMouseDown() {
		moving = true;
	}

	function onMouseMove(e) {
		if (moving) {
			left += e.movementX;
			top += e.movementY;
		}
	}

	function onMouseUp() {
		moving = false;
	}

	function init(node) {
		const handleElem = node.querySelector(handle) ?? node;

		handleElem.addEventListener("mousedown", onMouseDown, true);

		const closeElem = node.querySelector(close);

		closeElem?.addEventListener("click", onclose, true);

		return () => {
			handleElem.removeEventListener("mousedown", onMouseDown, true);
			closeElem?.removeEventListener("click", onclose, true);
		};
	}

	$$renderer.push(`<section${$.attr_style(`left: ${$.stringify(left)}px; top: ${$.stringify(top)}px;`)} class="draggable svelte-4amd0x" role="presentation">`);
	children($$renderer);
	$$renderer.push(`<!----></section>`);
}