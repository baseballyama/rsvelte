import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<div class="pointer-events-none absolute inset-0 rounded-[inherit]"></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function ProgressiveBlur($$anchor, $$props) {
	$.push($$props, true);

	const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };

	let direction = $.prop($$props, 'direction', 3, "bottom"),
		blurLayers = $.prop($$props, 'blurLayers', 3, 8),
		_class = $.prop($$props, 'class', 3, ""),
		blurIntensity = $.prop($$props, 'blurIntensity', 3, 0.25);

	let layers = $.derived(() => Math.max(blurLayers(), 2));
	let segmentSize = $.derived(() => 1 / (blurLayers() + 1));
	var $$exports = { GRADIENT_ANGLES };
	var div = root_1();

	$.each(div, 21, () => ({ length: $.get(layers) }), $.index, ($$anchor, _, index) => {
		const angle = $.derived(() => GRADIENT_ANGLES[direction()]);

		const gradientStops = $.derived(() => [
			index * $.get(segmentSize),
			(index + 1) * $.get(segmentSize),
			(index + 2) * $.get(segmentSize),
			(index + 3) * $.get(segmentSize)
		].map((pos, posIndex) => `rgba(255, 255, 255, ${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${pos * 100}%`));

		const gradient = $.derived(() => `linear-gradient(${$.get(angle)}deg, ${$.get(gradientStops).join(", ")})`);
		var div_1 = root();

		$.template_effect(() => $.set_style(div_1, `mask-image: ${$.get(gradient) ?? ''};
  -webkit-mask-image: ${$.get(gradient) ?? ''};
  backdrop-filter: blur(${index * blurIntensity()}px); z-index: ${index * 10};`));

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("relative", _class()))]);
	$.append($$anchor, div);

	return $.pop($$exports);
}