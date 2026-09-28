import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section role="presentation"><!></section>`);

export default function Draggable($$anchor, $$props) {
	// query
	let left = $.state(0);

	let top = $.state(0);
	let moving = false;

	function onMouseDown() {
		moving = true;
	}

	function onMouseMove(e) {
		if (moving) {
			$.set(left, $.get(left) + e.movementX);
			$.set(top, $.get(top) + e.movementY);
		}
	}

	function onMouseUp() {
		moving = false;
	}

	function init(node) {
		const handleElem = node.querySelector($$props.handle) ?? node;

		handleElem.addEventListener("mousedown", onMouseDown, true);

		const closeElem = node.querySelector($$props.close);

		closeElem?.addEventListener("click", $$props.onclose, true);

		return () => {
			handleElem.removeEventListener("mousedown", onMouseDown, true);
			closeElem?.removeEventListener("click", $$props.onclose, true);
		};
	}

	var section = root();

	$.event('mouseup', $.window, onMouseUp);
	$.event('mousemove', $.window, onMouseMove);
	$.set_class(section, 1, 'draggable svelte-4amd0x');

	var node_1 = $.child(section);

	$.snippet(node_1, () => $$props.children);
	$.reset(section);
	$.attach(section, () => init);
	$.template_effect(() => $.set_style(section, `left: ${$.get(left) ?? ''}px; top: ${$.get(top) ?? ''}px;`));
	$.append($$anchor, section);
}