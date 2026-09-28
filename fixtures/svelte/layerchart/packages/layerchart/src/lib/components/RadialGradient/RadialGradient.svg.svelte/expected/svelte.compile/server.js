import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function RadialGradient_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('radialGradient-', uid),
			stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
			cx = '50%',
			cy = '50%',
			fx = cx,
			fy = cy,
			r = '50%',
			spreadMethod = 'pad',
			transform = undefined,
			units = 'objectBoundingBox',
			children,
			stopsContent,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<defs><radialGradient${$.attributes(
			{
				id,
				cx,
				cy,
				fx,
				fy,
				r,
				spreadMethod,
				gradientTransform: transform,
				gradientUnits: units,
				...extractLayerProps({ ...rest, class: className }, 'lc-radial-gradient')
			},
			void 0,
			void 0,
			void 0,
			3
		)}>`);

		if (stopsContent) {
			$$renderer.push('<!--[0-->');
			stopsContent($$renderer);
			$$renderer.push(`<!---->`);
		} else if (stops) {
			$$renderer.push('<!--[1-->');

			const stopClass = cls('lc-radial-gradient-stop', className);

			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(stops);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let stop = each_array[i];

				if (Array.isArray(stop)) {
					$$renderer.push(`<!--[0--><stop${$.attr('offset', stop[0])}${$.attr('stop-color', stop[1])}${$.attr_class($.clsx(stopClass))}></stop>`);
				} else {
					$$renderer.push(`<!--[-1--><stop${$.attr('offset', `${$.stringify(i * (100 / (stops.length - 1)))}%`)}${$.attr('stop-color', stop)}${$.attr_class($.clsx(stopClass))}></stop>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></radialGradient></defs>`);
		children?.($$renderer, { id, gradient: `url(#${id})` });
		$$renderer.push(`<!---->`);
	});
}