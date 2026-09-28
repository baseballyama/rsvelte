import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="scrubber-tick"></div>`);
var root_1 = $.from_html(`<div class="scrubber"><div class="scrubber-track" role="slider"><div class="scrubber-fill"></div> <div class="scrubber-ticks"></div> <div class="scrubber-thumb-wrapper"><div class="scrubber-thumb"></div></div> <div class="scrubber-label"> </div> <div class="scrubber-value"> </div></div></div>`);

export default function PreviewSlider($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, 100),
		step = $.prop($$props, 'step', 3, 1),
		value = $.prop($$props, 'value', 3, 0),
		valueUnit = $.prop($$props, 'valueUnit', 3, ''),
		isDisabled = $.prop($$props, 'isDisabled', 3, false);

	let trackEl = $.state(null);
	let isDragging = $.state(false);
	let isHovering = $.state(false);
	let isHoverDevice = $.state(false);
	const range = $.derived(() => max() - min());
	const percentage = $.derived(() => $.get(range) > 0 ? (value() - min()) / $.get(range) * 100 : 0);
	const isActive = $.derived(() => $.get(isDragging) || $.get(isHoverDevice) && $.get(isHovering));

	$.user_effect(() => {
		const mq = window.matchMedia('(hover: hover) and (pointer: fine)');

		$.set(isHoverDevice, mq.matches, true);

		const onChange = (e) => $.set(isHoverDevice, e.matches, true);

		mq.addEventListener('change', onChange);

		return () => mq.removeEventListener('change', onChange);
	});

	const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

	function stepDecimals(s) {
		const str = s.toString();
		const dot = str.indexOf('.');

		return dot === -1 ? 0 : str.length - dot - 1;
	}

	function roundToStep(v, s, lo) {
		const raw = Math.round((v - lo) / s) * s + lo;
		const decimals = Math.max(stepDecimals(s), stepDecimals(lo));

		return Number(raw.toFixed(decimals));
	}

	function compute(clientX) {
		if (!$.get(trackEl)) return value();

		const rect = $.get(trackEl).getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		const raw = min() + ratio * $.get(range);

		return clamp(roundToStep(raw, step(), min()), min(), max());
	}

	function onPointerDown(e) {
		if (isDisabled()) return;

		e.preventDefault();
		$.get(trackEl)?.setPointerCapture(e.pointerId);
		$.set(isDragging, true);
		$$props.onChange?.(compute(e.clientX));
	}

	function onPointerMove(e) {
		if (!$.get(isDragging)) return;

		$$props.onChange?.(compute(e.clientX));
	}

	function onPointerUp() {
		$.set(isDragging, false);
	}

	function onKeyDown(e) {
		if (isDisabled()) return;

		let next;

		switch (e.key) {
			case 'ArrowRight':

			case 'ArrowUp':
				next = value() + step();
				break;

			case 'ArrowLeft':

			case 'ArrowDown':
				next = value() - step();
				break;

			case 'Home':
				next = min();
				break;

			case 'End':
				next = max();
				break;

			default:
				return;
		}

		e.preventDefault();
		$$props.onChange?.(clamp(roundToStep(next, step(), min()), min(), max()));
	}

	const ticks = 9;

	const formatted = $.derived(() => $$props.displayValue
		? $$props.displayValue(value())
		: `${Number(value().toFixed(stepDecimals(step())))}${valueUnit()}`);

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	let styles;
	var div_3 = $.sibling(div_2, 2);

	$.each(div_3, 21, () => Array.from({ length: ticks }, (_, i) => (i + 1) / (ticks + 1) * 100), $.index, ($$anchor, pos) => {
		var div_4 = root();
		let styles_1;

		$.template_effect(() => styles_1 = $.set_style(div_4, '', styles_1, { left: `${$.get(pos) ?? ''}%` }));
		$.append($$anchor, div_4);
	});

	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	let styles_2;
	var div_6 = $.sibling(div_5, 2);
	var text = $.only_child(div_6, true);
	var div_7 = $.sibling(div_6, 2);
	var text_1 = $.only_child(div_7, true);

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(trackEl, $$value), () => $.get(trackEl));
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div_1, 'aria-label', title());
		$.set_attribute(div_1, 'aria-valuemin', min());
		$.set_attribute(div_1, 'aria-valuemax', max());
		$.set_attribute(div_1, 'aria-valuenow', value());
		$.set_attribute(div_1, 'aria-disabled', isDisabled());
		$.set_attribute(div_1, 'tabindex', isDisabled() ? -1 : 0);
		$.set_attribute(div_1, 'data-dragging', $.get(isDragging));
		$.set_attribute(div_1, 'data-disabled', isDisabled());
		$.set_attribute(div_1, 'data-active', $.get(isActive));
		styles = $.set_style(div_2, '', styles, { width: `${$.get(percentage) ?? ''}%` });
		styles_2 = $.set_style(div_5, '', styles_2, { left: `${$.get(percentage) ?? ''}%` });
		$.set_text(text, title());
		$.set_text(text_1, $.get(formatted));
	});

	$.delegated('pointerdown', div_1, onPointerDown);
	$.delegated('pointermove', div_1, onPointerMove);
	$.delegated('pointerup', div_1, onPointerUp);
	$.event('mouseenter', div_1, () => $.set(isHovering, true));
	$.event('mouseleave', div_1, () => $.set(isHovering, false));
	$.delegated('keydown', div_1, onKeyDown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['pointerdown', 'pointermove', 'pointerup', 'keydown']);