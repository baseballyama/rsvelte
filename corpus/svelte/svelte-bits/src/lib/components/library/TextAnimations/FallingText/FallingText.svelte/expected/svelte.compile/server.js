import * as $ from 'svelte/internal/server';
import Matter from "matter-js";

export default function FallingText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text = "",
			highlightWords = [],
			highlightClass = "highlighted",
			trigger = "auto",
			backgroundColor = "transparent",
			wireframes = false,
			gravity = 1,
			mouseConstraintStiffness = 0.2,
			fontSize = "1rem"
		} = $$props;

		let containerEl = void 0;
		let canvasEl = void 0;
		let effectStarted = false;

		const words = $.derived(() => text.split(" ").map((word) => ({
			word,
			isHighlighted: highlightWords.some((hw) => word.startsWith(hw))
		})));

		let spanEls = [];

		function handleTrigger() {
			if (!effectStarted && (trigger === "click" || trigger === "hover")) {
				effectStarted = true;
			}
		}

		$$renderer.push(`<div class="z-1 relative pt-8 w-full h-full overflow-hidden text-center cursor-pointer" role="button" tabindex="0"><div class="inline-block"${$.attr_style('', { 'font-size': fontSize, 'line-height': 1.4 })}><!--[-->`);

		const each_array = $.ensure_array_like(words());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let { word, isHighlighted } = each_array[index];

			$$renderer.push(`<span${$.attr_class(`inline-block mx-0.5 select-none ${$.stringify(isHighlighted ? highlightClass : '')}`)}>${$.escape(word)}</span>`);
		}

		$$renderer.push(`<!--]--></div> <canvas class="top-0 left-0 z-0 absolute"></canvas></div>`);
	});
}