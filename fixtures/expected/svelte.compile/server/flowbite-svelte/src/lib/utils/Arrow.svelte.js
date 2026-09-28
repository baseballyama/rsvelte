import * as $ from 'svelte/internal/server';
import { getOppositePlacement, getSide } from "@floating-ui/utils";

export default function Arrow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { placement = "top", cords, class: className = "" } = $$props;
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
			// node.style[arrowSide] = px(-node.offsetWidth / 2 - (border ? 1 : 0) + 1);
			// node.classList.remove("border-t", "border-b", "border-s", "border-e");
			// border && (node.className += arrowBordersMap[arrowSide]);
		}

		$$renderer.push(`<div${$.attr_class(`popover-arrow clip pointer-events-none absolute block h-[10px] w-[10px] border-b border-l border-inherit bg-inherit text-inherit ${$.stringify(className)}`)}></div>`);
	});
}