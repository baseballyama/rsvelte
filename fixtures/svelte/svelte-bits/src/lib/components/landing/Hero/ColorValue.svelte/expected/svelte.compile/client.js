import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { hexToHsv, hsvToHex } from '$lib/utils/color';
import { playSound } from '$lib/utils/audio';

var root = $.from_html(`<button class="ln-hero-color-picker-preset"></button>`);
var root_1 = $.from_html(`<div class="ln-hero-color-picker"><div class="ln-hero-color-picker-area" role="slider" tabindex="-1" aria-label="Saturation and value"><div class="ln-hero-color-picker-thumb"></div></div> <div class="ln-hero-color-picker-hue" role="slider" tabindex="-1" aria-label="Hue"><div class="ln-hero-color-picker-thumb"></div></div> <div class="ln-hero-color-picker-presets"></div></div>`);
var root_2 = $.from_html(`<span class="ln-hero-code-value ln-hero-code-value--color" style="position: relative;"><span class="ln-hero-code-swatch" role="button" tabindex="0" aria-label="Open color picker"></span> <span style="cursor: pointer;" role="button" tabindex="0"> </span> <!></span>`);

export default function ColorValue($$anchor, $$props) {
	$.push($$props, true);

	// Orange-leaning palette (Svelte brand first), keep some hue variety
	const COLOR_PRESETS = [
		'#FF3E00',
		'#FF8A4C',
		'#F97316',
		'#EAB308',
		'#10B981',
		'#06B6D4',
		'#3B82F6',
		'#6366F1',
		'#EC4899',
		'#EF4444'
	];

	let open = $.state(false);
	let hsv = $.state($.proxy(hexToHsv($$props.value)));
	let wrapEl = $.state(void 0);
	let areaEl = $.state(void 0);
	let hueEl = $.state(void 0);

	$.user_effect(() => {
		if ($.get(open)) return;

		$.set(hsv, hexToHsv($$props.value), true);
	});

	onMount(() => {
		const onClickOutside = (e) => {
			if (!$.get(open)) return;
			if ($.get(wrapEl) && !$.get(wrapEl).contains(e.target)) $.set(open, false);
		};

		document.addEventListener('pointerdown', onClickOutside);

		return () => document.removeEventListener('pointerdown', onClickOutside);
	});

	function applyHsv(next) {
		$.set(hsv, next, true);
		$$props.onChange(hsvToHex(next.h, next.s, next.v));
	}

	function startDrag(onMove, onEnd) {
		document.addEventListener('pointermove', onMove);

		const onUp = () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			onEnd?.();
		};

		document.addEventListener('pointerup', onUp);
	}

	function onAreaDown(e) {
		e.preventDefault();
		e.stopPropagation();

		const update = (ev) => {
			if (!$.get(areaEl)) return;

			const rect = $.get(areaEl).getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));

			applyHsv({ h: $.get(hsv).h, s: x, v: 1 - y });
		};

		update(e);
		startDrag(update);
	}

	function onHueDown(e) {
		e.preventDefault();
		e.stopPropagation();

		const update = (ev) => {
			if (!$.get(hueEl)) return;

			const rect = $.get(hueEl).getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));

			applyHsv({ s: $.get(hsv).s, v: $.get(hsv).v, h: x * 360 });
		};

		update(e);
		startDrag(update);
	}

	let hueColor = $.derived(() => hsvToHex($.get(hsv).h, 1, 1));
	var span = root_2();
	var span_1 = $.child(span);
	var span_2 = $.sibling(span_1, 2);
	var text = $.only_child(span_2);
	var node = $.sibling(span_2, 2);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.only_child(div_1);

			$.bind_this(div_1, ($$value) => $.set(areaEl, $$value), () => $.get(areaEl));

			var div_3 = $.sibling(div_1, 2);
			var div_4 = $.only_child(div_3);

			$.bind_this(div_3, ($$value) => $.set(hueEl, $$value), () => $.get(hueEl));

			var div_5 = $.sibling(div_3, 2);

			$.each(div_5, 20, () => COLOR_PRESETS, (c) => c, ($$anchor, c) => {
				var button = root();

				$.template_effect(
					($0) => {
						$.set_style(button, `background: ${c ?? ''}; border-color: ${$0 ?? ''};`);
						$.set_attribute(button, 'aria-label', `Preset ${c ?? ''}`);
					},
					[
						() => $$props.value.toLowerCase() === c.toLowerCase() ? '#fff' : 'rgba(255,255,255,0.12)'
					]
				);

				$.delegated('click', button, () => {
					playSound('color');
					$.set(hsv, hexToHsv(c), true);
					$$props.onChange(c);
				});

				$.append($$anchor, button);
			});

			$.reset(div_5);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(div_1, 'aria-valuenow', $.get(hsv).s);
				$.set_style(div_1, `background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${$.get(hueColor) ?? ''})`);
				$.set_style(div_2, `left: ${$.get(hsv).s * 100}%; top: ${(1 - $.get(hsv).v) * 100}%;`);
				$.set_attribute(div_3, 'aria-valuenow', $.get(hsv).h);
				$.set_style(div_4, `left: ${$.get(hsv).h / 360 * 100}%; top: 50%;`);
			});

			$.delegated('pointerdown', div_1, onAreaDown);
			$.delegated('pointerdown', div_3, onHueDown);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent);
		});
	}

	$.reset(span);
	$.bind_this(span, ($$value) => $.set(wrapEl, $$value), () => $.get(wrapEl));

	$.template_effect(() => {
		$.set_style(span_1, `background: ${$$props.value ?? ''}; cursor: pointer;`);
		$.set_text(text, `"${$$props.value ?? ''}"`);
	});

	$.delegated('click', span_1, () => $.set(open, !$.get(open)));

	$.delegated('keydown', span_1, (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			$.set(open, !$.get(open));
		}
	});

	$.delegated('click', span_2, () => $.set(open, !$.get(open)));

	$.delegated('keydown', span_2, (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			$.set(open, !$.get(open));
		}
	});

	$.append($$anchor, span);
	$.pop();
}

$.delegate(['click', 'keydown', 'pointerdown']);