import * as $ from 'svelte/internal/server';
import { animate } from 'motion';

export default function TrueFocus($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			sentence = 'True Focus',
			separator = ' ',
			manualMode = false,
			blurAmount = 5,
			borderColor = 'green',
			glowColor = 'rgba(0, 255, 0, 0.6)',
			animationDuration = 0.5,
			pauseBetweenAnimations = 1
		} = $$props;

		const words = $.derived(() => sentence.split(separator));
		let currentIndex = 0;
		let lastActiveIndex = null;
		let containerEl = void 0;
		let wordEls = [];
		let overlayEl = void 0;
		let focusRect = { x: 0, y: 0, width: 0, height: 0 };

		function handleMouseEnter(index) {
			if (manualMode) {
				lastActiveIndex = index;
				currentIndex = index;
			}
		}

		function handleMouseLeave() {
			if (manualMode) {
				currentIndex = lastActiveIndex;
			}
		}

		$$renderer.push(`<div class="relative flex flex-wrap justify-center items-center gap-4"${$.attr_style('', { outline: 'none', 'user-select': 'none' })}><!--[-->`);

		const each_array = $.ensure_array_like(words());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let word = each_array[index];

			$$renderer.push(`<span role="button" tabindex="0" class="relative font-black text-[3rem] cursor-pointer"${$.attr_style('', {
				filter: index === currentIndex ? 'blur(0px)' : `blur(${blurAmount}px)`,
				transition: `filter ${animationDuration}s ease`,
				outline: 'none',
				'user-select': 'none'
			})}>${$.escape(word)}</span>`);
		}

		$$renderer.push(`<!--]--> <div class="top-0 left-0 box-border absolute border-0 pointer-events-none"${$.attr_style('', { '--border-color': borderColor, '--glow-color': glowColor })}><span class="-top-2.5 -left-2.5 absolute border-[3px] border-r-0 border-b-0 rounded-[3px] w-4 h-4"${$.attr_style('', {
			'border-color': 'var(--border-color)',
			filter: 'drop-shadow(0 0 4px var(--border-color))'
		})}></span> <span class="-top-2.5 -right-2.5 absolute border-[3px] border-b-0 border-l-0 rounded-[3px] w-4 h-4"${$.attr_style('', {
			'border-color': 'var(--border-color)',
			filter: 'drop-shadow(0 0 4px var(--border-color))'
		})}></span> <span class="-bottom-2.5 -left-2.5 absolute border-[3px] border-t-0 border-r-0 rounded-[3px] w-4 h-4"${$.attr_style('', {
			'border-color': 'var(--border-color)',
			filter: 'drop-shadow(0 0 4px var(--border-color))'
		})}></span> <span class="-right-2.5 -bottom-2.5 absolute border-[3px] border-t-0 border-l-0 rounded-[3px] w-4 h-4"${$.attr_style('', {
			'border-color': 'var(--border-color)',
			filter: 'drop-shadow(0 0 4px var(--border-color))'
		})}></span></div></div>`);
	});
}