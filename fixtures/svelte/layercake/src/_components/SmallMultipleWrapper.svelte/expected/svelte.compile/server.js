import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, calcExtents } from 'layercake';
import { Tween } from 'svelte/motion';
import * as eases from 'svelte/easing';
import Line from './Line.svelte';

export default function SmallMultipleWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, fullExtents, scale, extentGetters } = $$props;
		const tweenOptions = { duration: 300, easing: eases.cubicInOut };
		const extents = calcExtents(data, extentGetters);
		const xDomain = new Tween(scale === 'shared' ? fullExtents.x : extents.x, tweenOptions);
		const yDomain = new Tween(scale === 'shared' ? fullExtents.y : extents.y, tweenOptions);

		LayerCake($$renderer, {
			padding: { top: 2, right: 6, bottom: 2, left: 6 },
			x: extentGetters.x,
			y: extentGetters.y,
			data,
			xDomain: xDomain.current,
			yDomain: yDomain.current,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						Line($$renderer, { stroke: '#000' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}