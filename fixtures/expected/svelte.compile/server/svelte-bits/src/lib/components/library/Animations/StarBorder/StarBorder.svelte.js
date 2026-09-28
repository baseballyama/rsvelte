import * as $ from 'svelte/internal/server';

export default function StarBorder($$renderer, $$props) {
	let {
		children,
		as = 'button',
		class: className = '',
		color = 'white',
		speed = '6s',
		thickness = 1,
		$$slots,
		$$events,
		...rest
	} = $$props;

	const gradientBg = $.derived(() => `radial-gradient(circle, ${color}, transparent 10%)`);

	$.element(
		$$renderer,
		as,
		() => {
			$$renderer.push(`${$.attributes(
				{
					class: `star-border relative inline-block overflow-hidden rounded-[20px] ${$.stringify(className)}`,
					...rest
				},
				'svelte-1367xib',
				void 0,
				{ padding: `${$.stringify(thickness)}px 0` }
			)}`);
		},
		() => {
			$$renderer.push(`<div class="star-sweep-bottom absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full z-0 svelte-1367xib"${$.attr_style('', { background: gradientBg(), 'animation-duration': speed })}></div> <div class="star-sweep-top absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full z-0 svelte-1367xib"${$.attr_style('', { background: gradientBg(), 'animation-duration': speed })}></div> <div class="relative z-1 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px] svelte-1367xib">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
	);
}