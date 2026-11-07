import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from 'gsap';

var root = $.from_html(`<div tabindex="0" role="button"><div></div> <div class="absolute inset-0 w-full h-full"><!></div> <div class="absolute inset-0 w-full h-full z-[2]" style="display:none;"><!></div> <div class="absolute inset-0 w-full h-full pointer-events-none z-[3]"></div></div>`);

export default function PixelTransition($$anchor, $$props) {
	$.push($$props, true);

	let gridSize = $.prop($$props, 'gridSize', 3, 7),
		pixelColor = $.prop($$props, 'pixelColor', 3, 'currentColor'),
		animationStepDuration = $.prop($$props, 'animationStepDuration', 3, 0.3),
		once = $.prop($$props, 'once', 3, false),
		aspectRatio = $.prop($$props, 'aspectRatio', 3, '100%'),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	let pixelGrid;
	let activeEl;
	let isActive = $.state(false);
	let delayedCall = null;
	const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia('(pointer: coarse)').matches);

	$.user_effect(() => {
		if (!pixelGrid) return;

		pixelGrid.innerHTML = '';

		for (let row = 0; row < gridSize(); row++) {
			for (let col = 0; col < gridSize(); col++) {
				const p = document.createElement('div');

				p.classList.add('pixelated-image-card__pixel', 'absolute', 'hidden');
				p.style.backgroundColor = pixelColor();

				const size = 100 / gridSize();

				p.style.width = `${size}%`;
				p.style.height = `${size}%`;
				p.style.left = `${col * size}%`;
				p.style.top = `${row * size}%`;
				pixelGrid.appendChild(p);
			}
		}
	});

	function animate(activate) {
		$.set(isActive, activate, true);

		if (!pixelGrid || !activeEl) return;

		const pixels = pixelGrid.querySelectorAll('.pixelated-image-card__pixel');

		if (!pixels.length) return;

		gsap.killTweensOf(pixels);
		delayedCall?.kill();
		gsap.set(pixels, { display: 'none' });

		const stagger = animationStepDuration() / pixels.length;

		gsap.to(pixels, {
			display: 'block',
			duration: 0,
			stagger: { each: stagger, from: 'random' }
		});

		delayedCall = gsap.delayedCall(animationStepDuration(), () => {
			activeEl.style.display = activate ? 'block' : 'none';
			activeEl.style.pointerEvents = activate ? 'none' : '';
		});

		gsap.to(pixels, {
			display: 'none',
			duration: 0,
			delay: animationStepDuration(),
			stagger: { each: stagger, from: 'random' }
		});
	}

	const handleEnter = () => {
		if (!$.get(isActive)) animate(true);
	};

	const handleLeave = () => {
		if ($.get(isActive) && !once()) animate(false);
	};

	const handleClick = () => {
		if (!$.get(isActive)) animate(true); else if ($.get(isActive) && !once()) animate(false);
	};

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var node = $.child(div_2);

	$.snippet(node, () => $$props.firstContent);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	$.snippet(node_1, () => $$props.secondContent);
	$.reset(div_3);
	$.bind_this(div_3, ($$value) => activeEl = $$value, () => activeEl);

	var div_4 = $.sibling(div_3, 2);

	$.bind_this(div_4, ($$value) => pixelGrid = $$value, () => pixelGrid);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `bg-[#222] text-white rounded-[15px] border-2 border-white w-[300px] max-w-full relative overflow-hidden ${className() ?? ''}`);
		$.set_style(div, style());
		$.set_style(div_1, `padding-top:${aspectRatio() ?? ''};`);
		$.set_attribute(div_2, 'aria-hidden', $.get(isActive));
		$.set_attribute(div_3, 'aria-hidden', !$.get(isActive));
	});

	$.event('mouseenter', div, function (...$$args) {
		(!isTouch ? handleEnter : undefined)?.apply(this, $$args);
	});

	$.event('mouseleave', div, function (...$$args) {
		(!isTouch ? handleLeave : undefined)?.apply(this, $$args);
	});

	$.delegated('click', div, function (...$$args) {
		(isTouch ? handleClick : undefined)?.apply(this, $$args);
	});

	$.event('focus', div, function (...$$args) {
		(!isTouch ? handleEnter : undefined)?.apply(this, $$args);
	});

	$.event('blur', div, function (...$$args) {
		(!isTouch ? handleLeave : undefined)?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);