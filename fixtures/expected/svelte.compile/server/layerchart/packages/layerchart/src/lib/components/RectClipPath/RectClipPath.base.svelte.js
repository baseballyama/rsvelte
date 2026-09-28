import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';
import { createMotion, parseMotionProp } from '$lib/utils/motion.svelte.js';

export default function RectClipPath_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ClipPath,
			id = createId('clipPath-', uid),
			x = 0,
			y = 0,
			initialX,
			initialY,
			width,
			height,
			initialWidth,
			initialHeight,
			disabled = false,
			invert = false,
			motion,
			children: childrenProp
		} = $$props;

		// When `motion` is undefined `createMotion` returns a passthrough that just
		// reads the getter, so we can call it unconditionally and let the fast path
		// handle the no-motion case.
		const motionX = createMotion(initialX ?? x, () => x, motion && parseMotionProp(motion, 'x'));

		const motionY = createMotion(initialY ?? y, () => y, motion && parseMotionProp(motion, 'y'));
		const motionWidth = createMotion(initialWidth ?? width, () => width, motion && parseMotionProp(motion, 'width'));
		const motionHeight = createMotion(initialHeight ?? height, () => height, motion && parseMotionProp(motion, 'height'));
		const path = $.derived(() => `M${motionX.current},${motionY.current} h${motionWidth.current} v${motionHeight.current} h${-motionWidth.current} Z`);

		{
			function children($$renderer, { url }) {
				childrenProp?.($$renderer, { id, url });
				$$renderer.push(`<!---->`);
			}

			if (ClipPath) {
				$$renderer.push('<!--[-->');

				ClipPath($$renderer, {
					id,
					disabled,
					invert,
					path: path(),
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	});
}