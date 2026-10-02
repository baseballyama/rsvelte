import 'svelte/internal/disclose-version';
import { extractLayerProps } from '$lib/utils/attributes.js';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'interpolator',
	'steps',
	'height',
	'width',
	'ref'
]);

var root = $.from_svg(`<image></image>`);

export default function ColorRamp($$anchor, $$props) {
	$.push($$props, true);

	let steps = $.prop($$props, 'steps', 3, 10),
		height = $.prop($$props, 'height', 3, '20px'),
		width = $.prop($$props, 'width', 3, '100%'),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	let href = $.state('');

	$.user_effect(() => {
		const canvas = document.createElement('canvas');

		canvas.width = steps();
		canvas.height = 1;

		const context = canvas.getContext('2d');

		for (let i = 0; i < steps(); ++i) {
			if ($$props.interpolator) {
				context.fillStyle = $$props.interpolator(i / (steps() - 1));
			}

			context.fillRect(i, 0, 1, 1);
		}

		$.set(href, canvas.toDataURL(), true);
	});

	var image = root();

	$.attribute_effect(
		image,
		($0) => ({
			href: $.get(href),
			preserveAspectRatio: 'none',
			height: height(),
			width: width(),
			...$0
		}),
		[() => extractLayerProps(restProps, 'lc-color-ramp')]
	);

	$.bind_this(image, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, image);
	$.pop();
}