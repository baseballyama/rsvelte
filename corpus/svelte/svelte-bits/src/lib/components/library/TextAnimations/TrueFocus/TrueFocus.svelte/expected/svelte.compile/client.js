import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from 'motion';

var root = $.from_html(`<span role="button" tabindex="0" class="relative font-black text-[3rem] cursor-pointer"> </span>`);
var root_1 = $.from_html(`<div class="relative flex flex-wrap justify-center items-center gap-4"><!> <div class="top-0 left-0 box-border absolute border-0 pointer-events-none"><span class="-top-2.5 -left-2.5 absolute border-[3px] border-r-0 border-b-0 rounded-[3px] w-4 h-4"></span> <span class="-top-2.5 -right-2.5 absolute border-[3px] border-b-0 border-l-0 rounded-[3px] w-4 h-4"></span> <span class="-bottom-2.5 -left-2.5 absolute border-[3px] border-t-0 border-r-0 rounded-[3px] w-4 h-4"></span> <span class="-right-2.5 -bottom-2.5 absolute border-[3px] border-t-0 border-l-0 rounded-[3px] w-4 h-4"></span></div></div>`);

export default function TrueFocus($$anchor, $$props) {
	$.push($$props, true);

	let sentence = $.prop($$props, 'sentence', 3, 'True Focus'),
		separator = $.prop($$props, 'separator', 3, ' '),
		manualMode = $.prop($$props, 'manualMode', 3, false),
		blurAmount = $.prop($$props, 'blurAmount', 3, 5),
		borderColor = $.prop($$props, 'borderColor', 3, 'green'),
		glowColor = $.prop($$props, 'glowColor', 3, 'rgba(0, 255, 0, 0.6)'),
		animationDuration = $.prop($$props, 'animationDuration', 3, 0.5),
		pauseBetweenAnimations = $.prop($$props, 'pauseBetweenAnimations', 3, 1);

	const words = $.derived(() => sentence().split(separator()));
	let currentIndex = $.state(0);
	let lastActiveIndex = $.state(null);
	let containerEl = $.state(void 0);
	let wordEls = $.proxy([]);
	let overlayEl = $.state(void 0);
	let focusRect = $.state($.proxy({ x: 0, y: 0, width: 0, height: 0 }));

	$.user_effect(() => {
		if (manualMode()) return;

		const interval = setInterval(
			() => {
				$.set(currentIndex, ($.get(currentIndex) + 1) % $.get(words).length);
			},
			(animationDuration() + pauseBetweenAnimations()) * 1000
		);

		return () => clearInterval(interval);
	});

	$.user_effect(() => {
		const idx = $.get(currentIndex);

		if (idx === null || idx === -1) return;

		const wordEl = wordEls[idx];

		if (!wordEl || !$.get(containerEl)) return;

		const parentRect = $.get(containerEl).getBoundingClientRect();
		const activeRect = wordEl.getBoundingClientRect();

		$.set(
			focusRect,
			{
				x: activeRect.left - parentRect.left,
				y: activeRect.top - parentRect.top,
				width: activeRect.width,
				height: activeRect.height
			},
			true
		);
	});

	$.user_effect(() => {
		if (!$.get(overlayEl)) return;

		animate(
			$.get(overlayEl),
			{
				x: $.get(focusRect).x,
				y: $.get(focusRect).y,
				width: $.get(focusRect).width,
				height: $.get(focusRect).height,
				opacity: $.get(currentIndex) >= 0 ? 1 : 0
			},
			{ duration: animationDuration() }
		);
	});

	function handleMouseEnter(index) {
		if (manualMode()) {
			$.set(lastActiveIndex, index, true);
			$.set(currentIndex, index, true);
		}
	}

	function handleMouseLeave() {
		if (manualMode()) {
			$.set(currentIndex, $.get(lastActiveIndex), true);
		}
	}

	var div = root_1();

	$.set_style(div, '', {}, { outline: 'none', 'user-select': 'none' });

	var node = $.child(div);

	$.each(node, 17, () => $.get(words), $.index, ($$anchor, word, index) => {
		var span = root();
		let styles;
		var text = $.only_child(span, true);

		$.bind_this(span, ($$value, index) => wordEls[index] = $$value, (index) => wordEls?.[index], () => [index]);

		$.template_effect(() => {
			styles = $.set_style(span, '', styles, {
				filter: index === $.get(currentIndex) ? 'blur(0px)' : `blur(${blurAmount()}px)`,
				transition: `filter ${animationDuration()}s ease`,
				outline: 'none',
				'user-select': 'none'
			});

			$.set_text(text, $.get(word));
		});

		$.event('mouseenter', span, () => handleMouseEnter(index));
		$.event('mouseleave', span, handleMouseLeave);
		$.append($$anchor, span);
	});

	var div_1 = $.sibling(node, 2);
	let styles_1;
	var span_1 = $.child(div_1);

	$.set_style(span_1, '', {}, {
		'border-color': 'var(--border-color)',
		filter: 'drop-shadow(0 0 4px var(--border-color))'
	});

	var span_2 = $.sibling(span_1, 2);

	$.set_style(span_2, '', {}, {
		'border-color': 'var(--border-color)',
		filter: 'drop-shadow(0 0 4px var(--border-color))'
	});

	var span_3 = $.sibling(span_2, 2);

	$.set_style(span_3, '', {}, {
		'border-color': 'var(--border-color)',
		filter: 'drop-shadow(0 0 4px var(--border-color))'
	});

	var span_4 = $.sibling(span_3, 2);

	$.set_style(span_4, '', {}, {
		'border-color': 'var(--border-color)',
		filter: 'drop-shadow(0 0 4px var(--border-color))'
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(overlayEl, $$value), () => $.get(overlayEl));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.template_effect(() => styles_1 = $.set_style(div_1, '', styles_1, { '--border-color': borderColor(), '--glow-color': glowColor() }));
	$.append($$anchor, div);
	$.pop();
}