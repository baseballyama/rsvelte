import * as $ from 'svelte/internal/server';
import { animate } from 'motion';

export default function GradientText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className = '',
			colors = ['#FF8A4C', '#FFC18A', '#FF6B2C'],
			animationSpeed = 8,
			showBorder = false,
			direction = 'horizontal',
			pauseOnHover = false,
			yoyo = true
		} = $$props;

		let progress = 0;
		let isPaused = false;

		// reset on speed/yoyo change
		// Reference `animate` so the dep import is not tree-shaken (kept available for users who extend)
		void animate;

		const gradientAngle = $.derived(() => direction === 'horizontal'
			? 'to right'
			: direction === 'vertical' ? 'to bottom' : 'to bottom right');

		const gradientColors = $.derived(() => [...colors, colors[0]].join(', '));
		const backgroundImage = $.derived(() => `linear-gradient(${gradientAngle()}, ${gradientColors()})`);

		const backgroundSize = $.derived(() => direction === 'horizontal'
			? '300% 100%'
			: direction === 'vertical' ? '100% 300%' : '300% 300%');

		const backgroundPosition = $.derived(() => direction === 'vertical' ? `50% ${progress}%` : `${progress}% 50%`);

		$$renderer.push(`<div${$.attr_class(`relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer ${showBorder ? 'py-1 px-2' : ''} ${$.stringify(className)}`)} role="presentation">`);

		if (showBorder) {
			$$renderer.push(`<!--[0--><div class="absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]"${$.attr_style('', {
				'background-image': backgroundImage(),
				'background-size': backgroundSize(),
				'background-repeat': 'repeat',
				'background-position': backgroundPosition()
			})}><div class="absolute bg-black rounded-[1.25rem] z-[-1]" style="width:calc(100% - 2px);height:calc(100% - 2px);left:50%;top:50%;transform:translate(-50%,-50%);"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="inline-block relative z-2 text-transparent bg-clip-text"${$.attr_style('', {
			'background-image': backgroundImage(),
			'background-size': backgroundSize(),
			'background-repeat': 'repeat',
			'background-position': backgroundPosition(),
			'-webkit-background-clip': 'text'
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}