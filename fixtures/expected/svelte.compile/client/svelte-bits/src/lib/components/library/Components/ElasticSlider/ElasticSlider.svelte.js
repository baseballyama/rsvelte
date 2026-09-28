import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { motionValue, animate } from 'motion';

var root = $.from_svg(`<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12z"></path></svg>`);
var root_1 = $.from_svg(`<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05a4.5 4.5 0 0 0 2.5-4.02zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"></path></svg>`);
var root_2 = $.from_html(`<div><div class="slider-wrapper svelte-q3pu1o" role="presentation"><div class="slider-icon svelte-q3pu1o"><div class="slider-icon-inner svelte-q3pu1o"><!></div></div> <div class="slider-root svelte-q3pu1o" role="slider" tabindex="0"><div class="slider-track-wrapper svelte-q3pu1o"><div class="slider-track svelte-q3pu1o"><div class="slider-range svelte-q3pu1o"></div></div></div></div> <div class="slider-icon svelte-q3pu1o"><div class="slider-icon-inner svelte-q3pu1o"><!></div></div></div> <p class="value-indicator svelte-q3pu1o"> </p></div>`);

export default function ElasticSlider($$anchor, $$props) {
	$.push($$props, true);

	let defaultValue = $.prop($$props, 'defaultValue', 3, 50),
		startingValue = $.prop($$props, 'startingValue', 3, 0),
		maxValue = $.prop($$props, 'maxValue', 3, 100),
		className = $.prop($$props, 'class', 3, ''),
		isStepped = $.prop($$props, 'isStepped', 3, false),
		stepSize = $.prop($$props, 'stepSize', 3, 1);

	const MAX_OVERFLOW = 50;
	let value = $.state($.proxy(defaultValue()));

	$.user_effect(() => {
		$.set(value, defaultValue());
	});

	let region = 'middle';
	let sliderRef;
	let trackWrapperEl;
	let leftIconEl;
	let rightIconEl;
	let leftIconInner;
	let rightIconInner;
	let outerEl;
	const clientX = motionValue(0);
	const overflow = motionValue(0);
	const scale = motionValue(1);

	function decay(v, max) {
		if (max === 0) return 0;

		const entry = v / max;
		const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

		return sigmoid * max;
	}

	function applyTransforms() {
		if (!sliderRef || !trackWrapperEl || !outerEl) return;

		const o = overflow.get();
		const s = scale.get();
		const cx = clientX.get();
		const { left, width } = sliderRef.getBoundingClientRect();
		const opacity = 0.7 + (s - 1) / 0.2 * 0.3;

		outerEl.style.transform = `scale(${s})`;
		outerEl.style.opacity = String(opacity);

		const sx = 1 + o / Math.max(width, 1);
		const sy = 1 + Math.min(o, MAX_OVERFLOW) / MAX_OVERFLOW * (0.8 - 1);
		const origin = cx < left + width / 2 ? 'right' : 'left';
		const height = 6 + (s - 1) / 0.2 * 6;
		const margin = (s - 1) / 0.2 * -3;

		trackWrapperEl.style.transform = `scaleX(${sx}) scaleY(${sy})`;
		trackWrapperEl.style.transformOrigin = origin;
		trackWrapperEl.style.height = `${height}px`;
		trackWrapperEl.style.marginTop = `${margin}px`;
		trackWrapperEl.style.marginBottom = `${margin}px`;

		const leftX = region === 'left' ? -o / Math.max(s, 0.0001) : 0;
		const rightX = region === 'right' ? o / Math.max(s, 0.0001) : 0;

		if (leftIconEl) leftIconEl.style.transform = `translateX(${leftX}px)`;
		if (rightIconEl) rightIconEl.style.transform = `translateX(${rightX}px)`;
	}

	function pulseIcon(el) {
		el.animate(
			[
				{ transform: 'scale(1)' },
				{ transform: 'scale(1.4)' },
				{ transform: 'scale(1)' }
			],
			{ duration: 250, easing: 'ease-out' }
		);
	}

	onMount(() => {
		const unsubs = [
			overflow.on('change', applyTransforms),
			scale.on('change', applyTransforms),
			clientX.on('change', (latest) => {
				if (!sliderRef) return;

				const { left, right } = sliderRef.getBoundingClientRect();
				let newOverflow;

				if (latest < left) {
					if (region !== 'left' && leftIconInner) pulseIcon(leftIconInner);

					region = 'left';
					newOverflow = left - latest;
				} else if (latest > right) {
					if (region !== 'right' && rightIconInner) pulseIcon(rightIconInner);

					region = 'right';
					newOverflow = latest - right;
				} else {
					region = 'middle';
					newOverflow = 0;
				}

				overflow.jump(decay(newOverflow, MAX_OVERFLOW));
				applyTransforms();
			})
		];

		applyTransforms();

		return () => unsubs.forEach((u) => u());
	});

	function onPointerMove(e) {
		if (e.buttons > 0 && sliderRef) {
			const { left, width } = sliderRef.getBoundingClientRect();
			let newValue = startingValue() + (e.clientX - left) / width * (maxValue() - startingValue());

			if (isStepped()) newValue = Math.round(newValue / stepSize()) * stepSize();

			newValue = Math.min(Math.max(newValue, startingValue()), maxValue());
			$.set(value, newValue, true);
			clientX.jump(e.clientX);
		}
	}

	function onPointerDown(e) {
		onPointerMove(e);
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function onPointerUp() {
		animate(overflow, 0, { type: 'spring', bounce: 0.5 });
	}

	function onEnter() {
		animate(scale, 1.2);
	}

	function onLeave() {
		animate(scale, 1);
	}

	const rangePercentage = $.derived(() => ($.get(value) - startingValue()) / Math.max(1e-6, maxValue() - startingValue()) * 100);
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.leftIcon);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if ($$props.leftIcon) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => leftIconInner = $$value, () => leftIconInner);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => leftIconEl = $$value, () => leftIconEl);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var div_7 = $.only_child(div_6);

	$.reset(div_5);
	$.bind_this(div_5, ($$value) => trackWrapperEl = $$value, () => trackWrapperEl);
	$.reset(div_4);
	$.bind_this(div_4, ($$value) => sliderRef = $$value, () => sliderRef);

	var div_8 = $.sibling(div_4, 2);
	var div_9 = $.child(div_8);
	var node_2 = $.child(div_9);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.snippet(node_3, () => $$props.rightIcon);
			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.rightIcon) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_9);
	$.bind_this(div_9, ($$value) => rightIconInner = $$value, () => rightIconInner);
	$.reset(div_8);
	$.bind_this(div_8, ($$value) => rightIconEl = $$value, () => rightIconEl);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => outerEl = $$value, () => outerEl);

	var p = $.sibling(div_1, 2);
	var text = $.only_child(p, true);

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, `slider-container ${className() ?? ''}`, 'svelte-q3pu1o');
			$.set_attribute(div_4, 'aria-valuemin', startingValue());
			$.set_attribute(div_4, 'aria-valuemax', maxValue());
			$.set_attribute(div_4, 'aria-valuenow', $.get(value));
			$.set_style(div_7, `width:${$.get(rangePercentage) ?? ''}%;`);
			$.set_text(text, $0);
		},
		[() => Math.round($.get(value))]
	);

	$.event('mouseenter', div_1, onEnter);
	$.event('mouseleave', div_1, onLeave);
	$.delegated('touchstart', div_1, onEnter, void 0, true);
	$.delegated('touchend', div_1, onLeave);
	$.delegated('pointermove', div_4, onPointerMove);
	$.delegated('pointerdown', div_4, onPointerDown);
	$.delegated('pointerup', div_4, onPointerUp);
	$.event('pointercancel', div_4, onPointerUp);
	$.event('lostpointercapture', div_4, onPointerUp);
	$.append($$anchor, div);
	$.pop();
}

$.delegate([
	'touchstart',
	'touchend',
	'pointermove',
	'pointerdown',
	'pointerup'
]);