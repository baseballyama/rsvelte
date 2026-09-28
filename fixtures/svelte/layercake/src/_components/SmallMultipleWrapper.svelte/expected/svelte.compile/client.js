import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, calcExtents } from 'layercake';
import { Tween } from 'svelte/motion';
import * as eases from 'svelte/easing';
import Line from './Line.svelte';

export default function SmallMultipleWrapper($$anchor, $$props) {
	$.push($$props, true);

	const tweenOptions = { duration: 300, easing: eases.cubicInOut };
	const extents = calcExtents($$props.data, $$props.extentGetters);
	const xDomain = new Tween($$props.scale === 'shared' ? $$props.fullExtents.x : extents.x, tweenOptions);
	const yDomain = new Tween($$props.scale === 'shared' ? $$props.fullExtents.y : extents.y, tweenOptions);

	$.user_effect(() => {
		xDomain.target = $$props.scale === 'shared' ? $$props.fullExtents.x : extents.x;
	});

	$.user_effect(() => {
		yDomain.target = $$props.scale === 'shared' ? $$props.fullExtents.y : extents.y;
	});

	LayerCake($$anchor, {
		padding: { top: 2, right: 6, bottom: 2, left: 6 },
		get x() {
			return $$props.extentGetters.x;
		},

		get y() {
			return $$props.extentGetters.y;
		},

		get data() {
			return $$props.data;
		},

		get xDomain() {
			return xDomain.current;
		},

		get yDomain() {
			return yDomain.current;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Line($$anchor, { stroke: '#000' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}