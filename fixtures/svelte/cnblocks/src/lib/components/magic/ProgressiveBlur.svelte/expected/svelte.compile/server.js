import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function ProgressiveBlur($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };

		let {
			direction = "bottom",
			blurLayers = 8,
			class: _class = "",
			blurIntensity = 0.25
		} = $$props;

		let layers = $.derived(() => Math.max(blurLayers, 2));
		let segmentSize = $.derived(() => 1 / (blurLayers + 1));

		$$renderer.push(`<div${$.attr_class($.clsx(cn("relative", _class)))}><!--[-->`);

		const each_array = $.ensure_array_like({ length: layers() });

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let _ = each_array[index];
			const angle = GRADIENT_ANGLES[direction];

			const gradientStops = [
				index * segmentSize(),
				(index + 1) * segmentSize(),
				(index + 2) * segmentSize(),
				(index + 3) * segmentSize()
			].map((pos, posIndex) => `rgba(255, 255, 255, ${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${pos * 100}%`);

			const gradient = `linear-gradient(${angle}deg, ${gradientStops.join(", ")})`;

			$$renderer.push(`<div class="pointer-events-none absolute inset-0 rounded-[inherit]"${$.attr_style(`mask-image: ${gradient}; -webkit-mask-image: ${gradient}; backdrop-filter: blur(${$.stringify(index * blurIntensity)}px); z-index: ${$.stringify(index * 10)};`)}></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { GRADIENT_ANGLES });
	});
}