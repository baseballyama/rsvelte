import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getOppositePlacement, getSide } from "@floating-ui/utils";

var root = $.from_html(`<div></div>`);

export default function Arrow($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.prop($$props, 'placement', 3, "top"),
		className = $.prop($$props, 'class', 3, "");

	const px = (n) => n ? `${n}px` : "";

	// Prevent unused import warnings - these functions are used in the $effect below
	void getSide;

	void getOppositePlacement;

	function getBorderWidth(element) {
		const computedStyle = window.getComputedStyle(element);

		return Math.max(parseFloat(computedStyle.borderLeftWidth), parseFloat(computedStyle.borderBottomWidth)) - 0.3;
	}

	const rotationMap = {
		left: " rotate-45",
		right: " -rotate-135",
		top: " rotate-135",
		bottom: " -rotate-45"
	};

	function positioning(node) {
		$.user_effect(() => {
			node.style.left = px($$props.cords.x);
			node.style.top = px($$props.cords.y);
			node.style.right = "";
			node.style.bottom = "";

			let arrowSide = getSide(getOppositePlacement(placement()));

			// node.style[arrowSide] = px(-node.offsetWidth / 2 - (border ? 1 : 0) + 1);
			node.style[arrowSide] = px(-node.offsetWidth / 2 - getBorderWidth(node));

			// node.classList.remove("border-t", "border-b", "border-s", "border-e");
			// border && (node.className += arrowBordersMap[arrowSide]);
			node.classList.remove("rotate-45", "-rotate-45", "rotate-135", "-rotate-135");

			node.className += rotationMap[arrowSide];
		});
	}

	var div = root();

	$.action(div, ($$node) => positioning?.($$node));
	$.template_effect(() => $.set_class(div, 1, `popover-arrow clip pointer-events-none absolute block h-[10px] w-[10px] border-b border-l border-inherit bg-inherit text-inherit ${className() ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}