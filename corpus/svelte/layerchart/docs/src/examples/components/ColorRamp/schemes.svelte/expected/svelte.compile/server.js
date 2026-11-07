import * as $ from 'svelte/internal/server';
import * as d3chromatic from 'd3-scale-chromatic';
import { scaleQuantize } from 'd3-scale';
import { ColorRamp } from 'layerchart';

export default function Schemes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let width = '100%';
		let height = 20;
		const schemes = Object.entries(d3chromatic).filter(([key, value]) => key.startsWith('scheme'));

		$$renderer.push(`<div class="grid gap-4 h-100 overflow-auto pr-2"><!--[-->`);

		const each_array = $.ensure_array_like(schemes);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let [name, scheme] = each_array[$$index_1];

			if (typeof scheme[0] === 'string') {
				$$renderer.push(`<!--[0--><div><div class="text-sm">${$.escape(name)}</div> <svg${$.attr('width', width)}${$.attr('height', height)}>`);

				ColorRamp($$renderer, {
					interpolator: scaleQuantize([0, 1], scheme),
					width,
					height,
					class: '[image-rendering:pixelated]'
				});

				$$renderer.push(`<!----></svg></div>`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array_1 = $.ensure_array_like(scheme);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let s = each_array_1[i];

					if (Array.isArray(s)) {
						$$renderer.push(`<!--[0--><div><div class="text-sm">${$.escape(name)}[${$.escape(i)}]</div> <svg${$.attr('width', width)}${$.attr('height', height)}>`);

						ColorRamp($$renderer, {
							interpolator: scaleQuantize([0, 1], s),
							width,
							height,
							class: '[image-rendering:pixelated]'
						});

						$$renderer.push(`<!----></svg></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}