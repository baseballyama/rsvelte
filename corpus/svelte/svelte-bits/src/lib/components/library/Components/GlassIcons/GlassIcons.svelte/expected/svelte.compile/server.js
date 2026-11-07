import * as $ from 'svelte/internal/server';

export default function GlassIcons($$renderer, $$props) {
	let { items, class: className = '' } = $$props;

	const gradientMapping = {
		blue: 'linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))',
		purple: 'linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
		red: 'linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))',
		indigo: 'linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))',
		orange: 'linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))',
		green: 'linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))'
	};

	function getBg(color) {
		return gradientMapping[color] ?? color;
	}

	$$renderer.push(`<div${$.attr_class(`grid gap-[5em] grid-cols-2 md:grid-cols-3 mx-auto py-[3em] overflow-visible ${$.stringify(className)}`)}><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let item = each_array[index];

		$$renderer.push(`<button type="button"${$.attr('aria-label', item.label)}${$.attr_class(`relative bg-transparent outline-none border-none cursor-pointer w-[4.5em] h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group ${$.stringify(item.customClass ?? '')}`)}><span class="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"${$.attr_style(`background:${$.stringify(getBg(item.color))}; box-shadow:0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15);`)}></span> <span class="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.15)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [will-change:transform] transform group-hover:[transform:translate3d(0,0,2em)]" style="box-shadow:0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset;"><span class="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center" aria-hidden="true">`);
		item.icon($$renderer);
		$$renderer.push(`<!----></span></span> <span class="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-base opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)]">${$.escape(item.label)}</span></button>`);
	}

	$$renderer.push(`<!--]--></div>`);
}