import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function LinearGradient_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('linearGradient-', uid),
			stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
			vertical = false,
			x1 = '0%',
			y1 = '0%',
			x2 = vertical ? '0%' : '100%',
			y2 = vertical ? '100%' : '0%',
			rotate,
			units = 'objectBoundingBox',
			ref: refProp = void 0,
			class: className,
			stopsContent,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let ref = void 0;

		$$renderer.push(`<defs><linearGradient${$.attributes(
			{
				id,
				x1,
				y1,
				x2,
				y2,
				gradientTransform: rotate ? `rotate(${rotate})` : '',
				gradientUnits: units,
				...extractLayerProps(rest, 'lc-linear-gradient')
			},
			void 0,
			void 0,
			void 0,
			3
		)}>`);

		if (stopsContent) {
			$$renderer.push('<!--[0-->');
			stopsContent?.($$renderer);
			$$renderer.push(`<!---->`);
		} else if (stops) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array = $.ensure_array_like(stops);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let stop = each_array[i];

				if (Array.isArray(stop)) {
					$$renderer.push(`<!--[0--><stop${$.attr('offset', stop[0])}${$.attr('stop-color', stop[1])}${$.attr_class($.clsx(cls('lc-linear-gradient-stop', className)))}></stop>`);
				} else {
					$$renderer.push(`<!--[-1--><stop${$.attr('offset', `${$.stringify(i * (100 / (stops.length - 1)))}%`)}${$.attr('stop-color', stop)}${$.attr_class($.clsx(cls('lc-linear-gradient-stop', className)))}></stop>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></linearGradient></defs>`);
		children?.($$renderer, { id, gradient: `url(#${id})` });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref: refProp });
	});
}