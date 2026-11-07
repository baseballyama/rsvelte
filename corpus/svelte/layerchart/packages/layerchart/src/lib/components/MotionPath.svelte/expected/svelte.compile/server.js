import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function MotionPath($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			pathId = createId('motionPathId-', uid),
			objectId = createId('motionObjectId-', uid),
			duration,
			repeatCount,
			fill = 'freeze',
			rotate,
			ref: refProp = void 0,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;

		$$renderer.push(`<defs><animateMotion${$.attributes(
			{
				href: `#${$.stringify(
					// TODO: Investigate `calcMode:spline`, `keyTimes`, and `keySplines` to work with `svelte/easing`
					// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/calcMode
					// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keyTimes
					// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keySplines
					// https://medium.com/javarevisited/animate-your-scalable-vector-graphics-svg-56f5800cd34b
					// Restart animation anytime the component is remounted (otherwise it only ever plays once)
					objectId
				)}`,
				dur: duration,
				repeatCount,
				fill,
				rotate,
				...extractLayerProps(restProps, 'lc-motion-path')
			},
			void 0,
			void 0,
			void 0,
			3
		)}><mpath${$.attr('href', `#${$.stringify(pathId)}`)}></mpath></animateMotion></defs>`);

		children?.($$renderer, { pathId, objectId });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref: refProp });
	});
}