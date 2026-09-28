import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<text font-weight="bold" xml:space="preserve"><textPath xml:space="preserve"> </textPath></text>`);
var root_1 = $.from_html(`<div class="curved-loop-jacket svelte-h8hbnk"><svg class="curved-loop-svg svelte-h8hbnk" viewBox="0 0 1440 120"><text xml:space="preserve" style="visibility:hidden;opacity:0;pointer-events:none;"> </text><defs><path fill="none" stroke="transparent"></path></defs><!></svg></div>`);

export default function CurvedLoop($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let marqueeText = $.prop($$props, 'marqueeText', 3, ''),
		speed = $.prop($$props, 'speed', 3, 2),
		className = $.prop($$props, 'class', 3, ''),
		curveAmount = $.prop($$props, 'curveAmount', 3, 400),
		direction = $.prop($$props, 'direction', 3, 'left'),
		interactive = $.prop($$props, 'interactive', 3, true);

	const text = $.derived(() => {
		const hasTrailing = (/\s|\u00A0$/).test(marqueeText());

		return (hasTrailing ? marqueeText().replace(/\s+$/, '') : marqueeText()) + ' ';
	});

	let measureEl = $.state(void 0);
	let textPathEl = $.state(void 0);
	let spacing = $.state(0);
	let offset = $.state(0);
	let isDragging = $.state(false);
	const pathId = `curve-${uid}`;
	const pathD = $.derived(() => `M-100,40 Q500,${40 + curveAmount()} 1540,40`);
	let dragActive = false;
	let lastX = 0;
	let velX = 0;

	// svelte-ignore state_referenced_locally
	let dirInternal = direction();

	$.user_effect(() => {
		dirInternal = direction();
	});

	const totalText = $.derived(() => {
		const len = $.get(spacing);

		if (!len) return $.get(text);

		return Array(Math.ceil(1800 / len) + 2).fill($.get(text)).join('');
	});

	const ready = $.derived(() => $.get(spacing) > 0);

	$.user_effect(() => {
		void $.get(text);
		void className();

		if ($.get(measureEl)) {
			$.set(spacing, $.get(measureEl).getComputedTextLength(), true);
		}
	});

	$.user_effect(() => {
		if (!$.get(spacing)) return;

		if ($.get(textPathEl)) {
			const initial = -$.get(spacing);

			$.get(textPathEl).setAttribute('startOffset', initial + 'px');
			$.set(offset, initial);
		}
	});

	$.user_effect(() => {
		if (!$.get(spacing) || !$.get(ready)) return;

		void speed();

		let frame = 0;

		const step = () => {
			if (!dragActive && $.get(textPathEl)) {
				const delta = dirInternal === 'right' ? speed() : -speed();
				const currentOffset = parseFloat($.get(textPathEl).getAttribute('startOffset') || '0');
				let newOffset = currentOffset + delta;
				const wrapPoint = $.get(spacing);

				if (newOffset <= -wrapPoint) newOffset += wrapPoint;
				if (newOffset > 0) newOffset -= wrapPoint;

				$.get(textPathEl).setAttribute('startOffset', newOffset + 'px');
				$.set(offset, newOffset, true);
			}

			frame = requestAnimationFrame(step);
		};

		frame = requestAnimationFrame(step);

		return () => cancelAnimationFrame(frame);
	});

	function onPointerDown(e) {
		if (!interactive()) return;

		dragActive = true;
		$.set(isDragging, true);
		lastX = e.clientX;
		velX = 0;
		e.target?.setPointerCapture?.(e.pointerId);
	}

	function onPointerMove(e) {
		if (!interactive() || !dragActive || !$.get(textPathEl)) return;

		const dx = e.clientX - lastX;

		lastX = e.clientX;
		velX = dx;

		const currentOffset = parseFloat($.get(textPathEl).getAttribute('startOffset') || '0');
		let newOffset = currentOffset + dx;
		const wrapPoint = $.get(spacing);

		if (newOffset <= -wrapPoint) newOffset += wrapPoint;
		if (newOffset > 0) newOffset -= wrapPoint;

		$.get(textPathEl).setAttribute('startOffset', newOffset + 'px');
		$.set(offset, newOffset, true);
	}

	function endDrag() {
		if (!interactive()) return;

		dragActive = false;
		$.set(isDragging, false);
		dirInternal = velX > 0 ? 'right' : 'left';
	}

	const cursorStyle = $.derived(() => interactive() ? $.get(isDragging) ? 'grabbing' : 'grab' : 'auto');
	var div = root_1();
	let styles;
	var svg = $.child(div);
	var text_1 = $.child(svg);
	var text_2 = $.only_child(text_1, true);

	$.bind_this(text_1, ($$value) => $.set(measureEl, $$value), () => $.get(measureEl));

	var defs = $.sibling(text_1);
	var path = $.only_child(defs);
	var node = $.sibling(defs);

	{
		var consequent = ($$anchor) => {
			var text_3 = root();
			var textPath = $.child(text_3);
			var text_4 = $.only_child(textPath, true);

			$.bind_this(textPath, ($$value) => $.set(textPathEl, $$value), () => $.get(textPathEl));
			$.reset(text_3);

			$.template_effect(() => {
				$.set_class(text_3, 0, $.clsx(className()), 'svelte-h8hbnk');
				$.set_attribute(textPath, 'href', `#${pathId}`);
				$.set_attribute(textPath, 'startOffset', $.get(offset) + 'px');
				$.set_text(text_4, $.get(totalText));
			});

			$.append($$anchor, text_3);
		};

		$.if(node, ($$render) => {
			if ($.get(ready)) $$render(consequent);
		});
	}

	$.reset(svg);
	$.reset(div);

	$.template_effect(() => {
		styles = $.set_style(div, '', styles, {
			visibility: $.get(ready) ? 'visible' : 'hidden',
			cursor: $.get(cursorStyle)
		});

		$.set_text(text_2, $.get(text));
		$.set_attribute(path, 'id', pathId);
		$.set_attribute(path, 'd', $.get(pathD));
	});

	$.delegated('pointerdown', div, onPointerDown);
	$.delegated('pointermove', div, onPointerMove);
	$.delegated('pointerup', div, endDrag);
	$.event('pointerleave', div, endDrag);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['pointerdown', 'pointermove', 'pointerup']);