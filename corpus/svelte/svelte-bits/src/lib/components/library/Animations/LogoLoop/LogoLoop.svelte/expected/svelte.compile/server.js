import * as $ from 'svelte/internal/server';

const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;
const toCss = (v) => typeof v === 'number' ? `${v}px` : v;

export default function LogoLoop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			logos,
			speed = 120,
			direction = 'left',
			width = '100%',
			logoHeight = 28,
			gap = 32,
			pauseOnHover,
			hoverSpeed,
			fadeOut = false,
			fadeOutColor,
			scaleOnHover = false,
			ariaLabel = 'Partner logos',
			class: className = '',
			style = ''
		} = $$props;

		let container;
		let track;
		let seq;
		let seqWidth = 0;
		let seqHeight = 0;
		let copyCount = MIN_COPIES;
		let isHovered = false;
		const isVertical = $.derived(() => direction === 'up' || direction === 'down');
		const effectiveHoverSpeed = $.derived(() => hoverSpeed !== undefined ? hoverSpeed : pauseOnHover === false ? undefined : 0);

		const targetVelocity = $.derived(() => {
			const mag = Math.abs(speed);

			const dirMul = isVertical()
				? direction === 'up' ? 1 : -1
				: direction === 'left' ? 1 : -1;

			const sign = speed < 0 ? -1 : 1;

			return mag * dirMul * sign;
		});

		function update() {
			if (!container || !seq) return;

			const cw = container.clientWidth ?? 0;
			const r = seq.getBoundingClientRect();

			if (isVertical()) {
				const ph = container.parentElement?.clientHeight ?? 0;

				if (container && ph > 0) {
					const t = Math.ceil(ph);

					if (container.style.height !== `${t}px`) container.style.height = `${t}px`;
				}

				if (r.height > 0) {
					seqHeight = Math.ceil(r.height);

					const viewport = container.clientHeight || ph || r.height;

					copyCount = Math.max(MIN_COPIES, Math.ceil(viewport / r.height) + COPY_HEADROOM);
				}
			} else if (r.width > 0) {
				seqWidth = Math.ceil(r.width);
				copyCount = Math.max(MIN_COPIES, Math.ceil(cw / r.width) + COPY_HEADROOM);
			}
		}

		// preload images
		const cssVars = $.derived(() => `--logoloop-gap:${gap}px;--logoloop-logoHeight:${logoHeight}px;${fadeOutColor ? `--logoloop-fadeColor:${fadeOutColor};` : ''}--logoloop-fadeColorAuto:#0b0b0b;`);

		const widthStyle = $.derived(() => {
			const w = toCss(width);

			if (isVertical()) return w && w !== '100%' ? `width:${w};` : '';

			return `width:${w ?? '100%'};`;
		});

		$$renderer.push(`<div${$.attr_class(`relative group ${isVertical()
			? 'overflow-hidden h-full inline-block'
			: 'overflow-x-hidden'} ${scaleOnHover ? 'py-[calc(var(--logoloop-logoHeight)*0.1)]' : ''} ${$.stringify(className)}`)}${$.attr_style(`${cssVars()}${$.stringify(widthStyle())}${$.stringify(style)}`)} role="region"${$.attr('aria-label', ariaLabel)}>`);

		if (fadeOut) {
			$$renderer.push('<!--[0-->');

			if (isVertical()) {
				$$renderer.push(`<!--[0--><div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(24px,8%,120px)]" style="background:linear-gradient(to bottom, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div> <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(24px,8%,120px)]" style="background:linear-gradient(to top, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)]" style="background:linear-gradient(to right, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div> <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)]" style="background:linear-gradient(to left, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class(`flex will-change-transform select-none relative z-0 ${isVertical() ? 'flex-col h-max w-full' : 'flex-row w-max'}`)} role="presentation"><!--[-->`);

		const each_array = $.ensure_array_like(Array(copyCount));

		for (let copyIndex = 0, $$length = each_array.length; copyIndex < $$length; copyIndex++) {
			let _ = each_array[copyIndex];

			$$renderer.push(`<ul${$.attr_class(`flex items-center ${isVertical() ? 'flex-col' : ''}`)} role="list"${$.attr('aria-hidden', copyIndex > 0)}><!--[-->`);

			const each_array_1 = $.ensure_array_like(logos);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let item = each_array_1[i];

				$$renderer.push(`<li${$.attr_class(`flex-none text-[length:var(--logoloop-logoHeight)] leading-[1] ${isVertical()
					? 'mb-[var(--logoloop-gap)]'
					: 'mr-[var(--logoloop-gap)]'} ${scaleOnHover ? 'overflow-visible group/item' : ''}`)} role="listitem">`);

				if (item.href) {
					$$renderer.push(`<!--[0--><a class="inline-flex items-center no-underline rounded transition-opacity duration-200 hover:opacity-80"${$.attr('href', item.href)}${$.attr('aria-label', item.alt ?? item.title ?? 'logo link')} target="_blank" rel="noreferrer noopener"><img${$.attr_class(`h-[var(--logoloop-logoHeight)] w-auto block object-contain pointer-events-none ${scaleOnHover
						? 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-[1.2]'
						: ''}`)}${$.attr('src', item.src)}${$.attr('srcset', item.srcSet)}${$.attr('sizes', item.sizes)}${$.attr('width', item.width)}${$.attr('height', item.height)}${$.attr('alt', item.alt ?? '')}${$.attr('title', item.title)} loading="lazy" decoding="async" draggable="false"/></a>`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attr_class(`h-[var(--logoloop-logoHeight)] w-auto block object-contain pointer-events-none ${scaleOnHover
						? 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-[1.2]'
						: ''}`)}${$.attr('src', item.src)}${$.attr('srcset', item.srcSet)}${$.attr('sizes', item.sizes)}${$.attr('width', item.width)}${$.attr('height', item.height)}${$.attr('alt', item.alt ?? '')}${$.attr('title', item.title)} loading="lazy" decoding="async" draggable="false"/>`);
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}