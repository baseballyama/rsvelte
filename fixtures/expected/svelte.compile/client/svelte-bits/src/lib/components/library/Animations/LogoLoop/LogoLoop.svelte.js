import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;
const toCss = (v) => typeof v === 'number' ? `${v}px` : v;
var root = $.from_html(`<div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(24px,8%,120px)]" style="background:linear-gradient(to bottom, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div> <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(24px,8%,120px)]" style="background:linear-gradient(to top, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div>`, 1);
var root_1 = $.from_html(`<div aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)]" style="background:linear-gradient(to right, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div> <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)]" style="background:linear-gradient(to left, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"></div>`, 1);
var root_2 = $.from_html(`<a class="inline-flex items-center no-underline rounded transition-opacity duration-200 hover:opacity-80" target="_blank" rel="noreferrer noopener"><img loading="lazy" decoding="async" draggable="false"/></a>`);
var root_3 = $.from_html(`<img loading="lazy" decoding="async" draggable="false"/>`);
var root_4 = $.from_html(`<li role="listitem"><!></li>`);
var root_5 = $.from_html(`<ul role="list"></ul>`);
var root_6 = $.from_html(`<div role="region"><!> <div role="presentation"></div></div>`);

export default function LogoLoop($$anchor, $$props) {
	$.push($$props, true);

	let speed = $.prop($$props, 'speed', 3, 120),
		direction = $.prop($$props, 'direction', 3, 'left'),
		width = $.prop($$props, 'width', 3, '100%'),
		logoHeight = $.prop($$props, 'logoHeight', 3, 28),
		gap = $.prop($$props, 'gap', 3, 32),
		fadeOut = $.prop($$props, 'fadeOut', 3, false),
		scaleOnHover = $.prop($$props, 'scaleOnHover', 3, false),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, 'Partner logos'),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	let container;
	let track;
	let seq;
	let seqWidth = $.state(0);
	let seqHeight = $.state(0);
	let copyCount = $.state(MIN_COPIES);
	let isHovered = $.state(false);
	const isVertical = $.derived(() => direction() === 'up' || direction() === 'down');

	const effectiveHoverSpeed = $.derived(() => $$props.hoverSpeed !== undefined
		? $$props.hoverSpeed
		: $$props.pauseOnHover === false ? undefined : 0);

	const targetVelocity = $.derived(() => {
		const mag = Math.abs(speed());

		const dirMul = $.get(isVertical)
			? direction() === 'up' ? 1 : -1
			: direction() === 'left' ? 1 : -1;

		const sign = speed() < 0 ? -1 : 1;

		return mag * dirMul * sign;
	});

	function update() {
		if (!container || !seq) return;

		const cw = container.clientWidth ?? 0;
		const r = seq.getBoundingClientRect();

		if ($.get(isVertical)) {
			const ph = container.parentElement?.clientHeight ?? 0;

			if (container && ph > 0) {
				const t = Math.ceil(ph);

				if (container.style.height !== `${t}px`) container.style.height = `${t}px`;
			}

			if (r.height > 0) {
				$.set(seqHeight, Math.ceil(r.height), true);

				const viewport = container.clientHeight || ph || r.height;

				$.set(copyCount, Math.max(MIN_COPIES, Math.ceil(viewport / r.height) + COPY_HEADROOM), true);
			}
		} else if (r.width > 0) {
			$.set(seqWidth, Math.ceil(r.width), true);
			$.set(copyCount, Math.max(MIN_COPIES, Math.ceil(cw / r.width) + COPY_HEADROOM), true);
		}
	}

	$.user_effect(() => {
		void $$props.logos;
		void gap();
		void logoHeight();
		void $.get(isVertical);

		if (!container || !seq) return;

		const ro = new ResizeObserver(update);

		ro.observe(container);
		ro.observe(seq);
		update();

		// preload images
		const imgs = seq.querySelectorAll('img');

		let pending = imgs.length;

		const onLoad = () => {
			pending -= 1;

			if (pending <= 0) update();
		};

		imgs.forEach((img) => {
			const i = img;

			if (i.complete) onLoad(); else {
				i.addEventListener('load', onLoad, { once: true });
				i.addEventListener('error', onLoad, { once: true });
			}
		});

		return () => ro.disconnect();
	});

	$.user_effect(() => {
		if (!track) return;

		const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const seqSize = $.get(isVertical) ? $.get(seqHeight) : $.get(seqWidth);
		let raf = 0;
		let last = null;
		let offset = 0;
		let velocity = 0;

		if (seqSize > 0) {
			offset = (offset % seqSize + seqSize) % seqSize;

			track.style.transform = $.get(isVertical)
				? `translate3d(0, ${-offset}px, 0)`
				: `translate3d(${-offset}px, 0, 0)`;
		}

		if (reduced) {
			track.style.transform = 'translate3d(0, 0, 0)';

			return;
		}

		const animate = (t) => {
			if (last === null) last = t;

			const dt = Math.max(0, t - last) / 1000;

			last = t;

			const target = $.get(isHovered) && $.get(effectiveHoverSpeed) !== undefined ? $.get(effectiveHoverSpeed) : $.get(targetVelocity);
			const ef = 1 - Math.exp(-dt / SMOOTH_TAU);

			velocity += (target - velocity) * ef;

			if (seqSize > 0) {
				let next = offset + velocity * dt;

				next = (next % seqSize + seqSize) % seqSize;
				offset = next;

				track.style.transform = $.get(isVertical)
					? `translate3d(0, ${-offset}px, 0)`
					: `translate3d(${-offset}px, 0, 0)`;
			}

			raf = requestAnimationFrame(animate);
		};

		raf = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(raf);
	});

	const cssVars = $.derived(() => `--logoloop-gap:${gap()}px;--logoloop-logoHeight:${logoHeight()}px;${$$props.fadeOutColor ? `--logoloop-fadeColor:${$$props.fadeOutColor};` : ''}--logoloop-fadeColorAuto:#0b0b0b;`);

	const widthStyle = $.derived(() => {
		const w = toCss(width());

		if ($.get(isVertical)) return w && w !== '100%' ? `width:${w};` : '';

		return `width:${w ?? '100%'};`;
	});

	var div = root_6();
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();

					$.next(2);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = root_1();

					$.next(2);
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isVertical)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (fadeOut()) $$render(consequent_1);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => Array($.get(copyCount)), $.index, ($$anchor, _, copyIndex) => {
		var ul = root_5();

		$.set_attribute(ul, 'aria-hidden', copyIndex > 0);

		$.each(ul, 21, () => $$props.logos, $.index, ($$anchor, item) => {
			var li = root_4();
			var node_2 = $.child(li);

			{
				var consequent_2 = ($$anchor) => {
					var a = root_2();
					var img_1 = $.only_child(a);

					$.template_effect(() => {
						$.set_attribute(a, 'href', $.get(item).href);
						$.set_attribute(a, 'aria-label', $.get(item).alt ?? $.get(item).title ?? 'logo link');

						$.set_class(img_1, 1, `h-[var(--logoloop-logoHeight)] w-auto block object-contain pointer-events-none ${scaleOnHover()
							? 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-[1.2]'
							: ''}`);

						$.set_attribute(img_1, 'src', $.get(item).src);
						$.set_attribute(img_1, 'srcset', $.get(item).srcSet);
						$.set_attribute(img_1, 'sizes', $.get(item).sizes);
						$.set_attribute(img_1, 'width', $.get(item).width);
						$.set_attribute(img_1, 'height', $.get(item).height);
						$.set_attribute(img_1, 'alt', $.get(item).alt ?? '');
						$.set_attribute(img_1, 'title', $.get(item).title);
					});

					$.append($$anchor, a);
				};

				var alternate_1 = ($$anchor) => {
					var img_2 = root_3();

					$.template_effect(() => {
						$.set_class(img_2, 1, `h-[var(--logoloop-logoHeight)] w-auto block object-contain pointer-events-none ${scaleOnHover()
							? 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-[1.2]'
							: ''}`);

						$.set_attribute(img_2, 'src', $.get(item).src);
						$.set_attribute(img_2, 'srcset', $.get(item).srcSet);
						$.set_attribute(img_2, 'sizes', $.get(item).sizes);
						$.set_attribute(img_2, 'width', $.get(item).width);
						$.set_attribute(img_2, 'height', $.get(item).height);
						$.set_attribute(img_2, 'alt', $.get(item).alt ?? '');
						$.set_attribute(img_2, 'title', $.get(item).title);
					});

					$.append($$anchor, img_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(item).href) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(li);

			$.template_effect(() => $.set_class(li, 1, `flex-none text-[length:var(--logoloop-logoHeight)] leading-[1] ${$.get(isVertical)
				? 'mb-[var(--logoloop-gap)]'
				: 'mr-[var(--logoloop-gap)]'} ${scaleOnHover() ? 'overflow-visible group/item' : ''}`));

			$.append($$anchor, li);
		});

		$.reset(ul);
		$.bind_this(ul, ($$value) => seq = $$value, () => seq);
		$.template_effect(() => $.set_class(ul, 1, `flex items-center ${$.get(isVertical) ? 'flex-col' : ''}`));
		$.append($$anchor, ul);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => track = $$value, () => track);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(() => {
		$.set_class(div, 1, `relative group ${$.get(isVertical)
			? 'overflow-hidden h-full inline-block'
			: 'overflow-x-hidden'} ${scaleOnHover() ? 'py-[calc(var(--logoloop-logoHeight)*0.1)]' : ''} ${className() ?? ''}`);

		$.set_style(div, `${$.get(cssVars) ?? ''}${$.get(widthStyle) ?? ''}${style() ?? ''}`);
		$.set_attribute(div, 'aria-label', ariaLabel());
		$.set_class(div_1, 1, `flex will-change-transform select-none relative z-0 ${$.get(isVertical) ? 'flex-col h-max w-full' : 'flex-row w-max'}`);
	});

	$.event('mouseenter', div_1, () => {
		if ($.get(effectiveHoverSpeed) !== undefined) $.set(isHovered, true);
	});

	$.event('mouseleave', div_1, () => {
		if ($.get(effectiveHoverSpeed) !== undefined) $.set(isHovered, false);
	});

	$.append($$anchor, div);
	$.pop();
}