import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { motionValue, animate } from 'motion';

var root = $.from_html(`<span class="relative inline-flex items-center justify-center">.</span>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span class="relative inline-flex overflow-hidden"></span>`);
var root_3 = $.from_html(`<span><span></span> <span style="pointer-events:none;position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;"><span></span> <span></span></span></span>`);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	let fontSize = $.prop($$props, 'fontSize', 3, 100),
		padding = $.prop($$props, 'padding', 3, 0),
		gap = $.prop($$props, 'gap', 3, 8),
		borderRadius = $.prop($$props, 'borderRadius', 3, 4),
		horizontalPadding = $.prop($$props, 'horizontalPadding', 3, 8),
		textColor = $.prop($$props, 'textColor', 3, 'inherit'),
		fontWeight = $.prop($$props, 'fontWeight', 3, 'inherit'),
		containerStyle = $.prop($$props, 'containerStyle', 3, ''),
		counterStyle = $.prop($$props, 'counterStyle', 3, ''),
		digitStyle = $.prop($$props, 'digitStyle', 3, ''),
		gradientHeight = $.prop($$props, 'gradientHeight', 3, 16),
		gradientFrom = $.prop($$props, 'gradientFrom', 3, 'black'),
		gradientTo = $.prop($$props, 'gradientTo', 3, 'transparent'),
		topGradientStyle = $.prop($$props, 'topGradientStyle', 3, ''),
		bottomGradientStyle = $.prop($$props, 'bottomGradientStyle', 3, '');

	function autoPlaces(v) {
		const a = [...v.toString()];

		return a.map((ch, i) => {
			if (ch === '.') return '.';

			const dotIndex = a.indexOf('.');
			const isInteger = dotIndex === -1;

			const exponent = isInteger
				? a.length - i - 1
				: i < dotIndex ? dotIndex - i - 1 : -(i - dotIndex);

			return 10 ** exponent;
		});
	}

	const resolvedPlaces = $.derived(() => $$props.places ?? autoPlaces($$props.value));
	const height = $.derived(() => fontSize() + padding());

	function normalizeNearInteger(num) {
		const nearest = Math.round(num);
		const tolerance = 1e-9 * Math.max(1, Math.abs(num));

		return Math.abs(num - nearest) < tolerance ? nearest : num;
	}

	function getValueRoundedToPlace(v, place) {
		return Math.floor(normalizeNearInteger(v / place));
	}

	// One motion value per digit slot, plus a reactive latestValues record so the
	// rendered transform updates on every motion-driven tick.
	const motionValues = new Map();

	let latestValues = $.state($.proxy({}));

	function getOrCreateMV(slot, target) {
		let mv = motionValues.get(slot);

		if (!mv) {
			mv = motionValue(target);
			motionValues.set(slot, mv);
			$.get(latestValues)[slot] = target;

			mv.on('change', (v) => {
				$.set(latestValues, { ...$.get(latestValues), [slot]: v }, true);
			});
		}

		return mv;
	}

	$.user_effect(() => {
		$.get(resolvedPlaces).forEach((place, slot) => {
			if (place === '.') return;

			const target = getValueRoundedToPlace($$props.value, place);
			const mv = getOrCreateMV(slot, target);

			animate(mv, target, { type: 'spring', stiffness: 250, damping: 30 });
		});
	});

	function offsetForNumber(latest, number, h) {
		const placeValue = latest % 10;
		const offset = (10 + number - placeValue) % 10;
		let memo = offset * h;

		if (offset > 5) memo -= 10 * h;

		return memo;
	}

	var span = root_3();
	var span_1 = $.child(span);

	$.each(span_1, 21, () => $.get(resolvedPlaces), $.index, ($$anchor, place, slot) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var span_2 = root();

				$.template_effect(() => $.set_style(span_2, `height:${$.get(height) ?? ''}px;width:fit-content;${digitStyle() ?? ''}`));
				$.append($$anchor, span_2);
			};

			var alternate = ($$anchor) => {
				var span_3 = root_2();

				$.each(span_3, 20, () => Array.from({ length: 10 }, (_, i) => i), (n) => n, ($$anchor, n) => {
					var span_4 = root_1();
					var text = $.only_child(span_4, true);

					$.template_effect(
						($0) => {
							$.set_style(span_4, `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:translateY(${$0 ?? ''}px);`);
							$.set_text(text, n);
						},
						[
							() => offsetForNumber($.get(latestValues)[slot] ?? getValueRoundedToPlace($$props.value, $.get(place)), n, $.get(height))
						]
					);

					$.append($$anchor, span_4);
				});

				$.reset(span_3);
				$.template_effect(() => $.set_style(span_3, `height:${$.get(height) ?? ''}px;width:1ch;font-variant-numeric:tabular-nums;${digitStyle() ?? ''}`));
				$.append($$anchor, span_3);
			};

			$.if(node, ($$render) => {
				if ($.get(place) === '.') $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(span_1);

	var span_5 = $.sibling(span_1, 2);
	var span_6 = $.child(span_5);
	var span_7 = $.sibling(span_6, 2);

	$.reset(span_5);
	$.reset(span);

	$.template_effect(() => {
		$.set_style(span, `position:relative;display:inline-block;${containerStyle() ?? ''}`);
		$.set_style(span_1, `font-size:${fontSize() ?? ''}px;display:flex;gap:${gap() ?? ''}px;overflow:hidden;border-radius:${borderRadius() ?? ''}px;padding-left:${horizontalPadding() ?? ''}px;padding-right:${horizontalPadding() ?? ''}px;line-height:1;color:${textColor() ?? ''};font-weight:${fontWeight() ?? ''};direction:ltr;${counterStyle() ?? ''}`);
		$.set_style(span_6, topGradientStyle() || `height:${gradientHeight()}px;background:linear-gradient(to bottom, ${gradientFrom()}, ${gradientTo()});`);
		$.set_style(span_7, bottomGradientStyle() || `height:${gradientHeight()}px;background:linear-gradient(to top, ${gradientFrom()}, ${gradientTo()});`);
	});

	$.append($$anchor, span);
	$.pop();
}