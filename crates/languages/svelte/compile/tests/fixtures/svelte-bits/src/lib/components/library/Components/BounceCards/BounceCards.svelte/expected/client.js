import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<div role="presentation"><img class="w-full h-full object-cover"/></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function BounceCards($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		images = $.prop($$props, 'images', 19, () => []),
		containerWidth = $.prop($$props, 'containerWidth', 3, 400),
		containerHeight = $.prop($$props, 'containerHeight', 3, 400),
		animationDelay = $.prop($$props, 'animationDelay', 3, 0.5),
		animationStagger = $.prop($$props, 'animationStagger', 3, 0.06),
		easeType = $.prop($$props, 'easeType', 3, 'elastic.out(1, 0.8)'),
		transformStyles = $.prop($$props, 'transformStyles', 19, () => [
			'rotate(10deg) translate(-170px)',
			'rotate(5deg) translate(-85px)',
			'rotate(-3deg)',
			'rotate(-10deg) translate(85px)',
			'rotate(2deg) translate(170px)'
		]),
		enableHover = $.prop($$props, 'enableHover', 3, false);

	let containerRef;

	onMount(() => {
		const ctx = gsap.context(
			() => {
				gsap.fromTo('.bc-card', { scale: 0 }, {
					scale: 1,
					stagger: animationStagger(),
					ease: easeType(),
					delay: animationDelay()
				});
			},
			containerRef
		);

		return () => ctx.revert();
	});

	function getNoRotationTransform(t) {
		const hasRotate = (/rotate\([\s\S]*?\)/).test(t);

		if (hasRotate) return t.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
		if (t === 'none') return 'rotate(0deg)';

		return `${t} rotate(0deg)`;
	}

	function getPushedTransform(base, offsetX) {
		const re = /translate\(([-0-9.]+)px\)/;
		const m = base.match(re);

		if (m) {
			const newX = parseFloat(m[1]) + offsetX;

			return base.replace(re, `translate(${newX}px)`);
		}

		return base === 'none'
			? `translate(${offsetX}px)`
			: `${base} translate(${offsetX}px)`;
	}

	function pushSiblings(hoveredIdx) {
		if (!enableHover() || !containerRef) return;

		const q = gsap.utils.selector(containerRef);

		images().forEach((_, i) => {
			const selector = q(`.bc-card-${i}`);

			gsap.killTweensOf(selector);

			const base = transformStyles()[i] || 'none';

			if (i === hoveredIdx) {
				gsap.to(selector, {
					transform: getNoRotationTransform(base),
					duration: 0.4,
					ease: 'back.out(1.4)',
					overwrite: 'auto'
				});
			} else {
				const offsetX = i < hoveredIdx ? -160 : 160;

				gsap.to(selector, {
					transform: getPushedTransform(base, offsetX),
					duration: 0.4,
					ease: 'back.out(1.4)',
					delay: Math.abs(hoveredIdx - i) * 0.05,
					overwrite: 'auto'
				});
			}
		});
	}

	function resetSiblings() {
		if (!enableHover() || !containerRef) return;

		const q = gsap.utils.selector(containerRef);

		images().forEach((_, i) => {
			const selector = q(`.bc-card-${i}`);

			gsap.killTweensOf(selector);

			gsap.to(selector, {
				transform: transformStyles()[i] || 'none',
				duration: 0.4,
				ease: 'back.out(1.4)',
				overwrite: 'auto'
			});
		});
	}

	var div = root_1();

	$.each(div, 21, images, $.index, ($$anchor, src, idx) => {
		var div_1 = root();

		$.set_class(div_1, 1, `bc-card bc-card-${idx} absolute w-[200px] aspect-square border-8 border-white rounded-[30px] overflow-hidden`);

		var img = $.child(div_1);

		$.set_attribute(img, 'alt', `card-${idx}`);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_style(div_1, `box-shadow:0 4px 10px rgba(0,0,0,0.2); transform:${(transformStyles()[idx] || 'none') ?? ''};`);
			$.set_attribute(img, 'src', $.get(src));
		});

		$.event('mouseenter', div_1, () => pushSiblings(idx));
		$.event('mouseleave', div_1, resetSiblings);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);

	$.template_effect(() => {
		$.set_class(div, 1, `relative flex items-center justify-center ${className() ?? ''}`);
		$.set_style(div, `width:${containerWidth() ?? ''}px;height:${containerHeight() ?? ''}px;`);
	});

	$.append($$anchor, div);
	$.pop();
}