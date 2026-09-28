import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';
import { createMotion, parseMotionProp } from '$lib/utils/motion.svelte.js';

export default function RectClipPath_base($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('clipPath-', uid)),
		x = $.prop($$props, 'x', 3, 0),
		y = $.prop($$props, 'y', 3, 0),
		disabled = $.prop($$props, 'disabled', 3, false),
		invert = $.prop($$props, 'invert', 3, false);

	// When `motion` is undefined `createMotion` returns a passthrough that just
	// reads the getter, so we can call it unconditionally and let the fast path
	// handle the no-motion case.
	const motionX = createMotion($$props.initialX ?? x(), () => x(), $$props.motion && parseMotionProp($$props.motion, 'x'));

	const motionY = createMotion($$props.initialY ?? y(), () => y(), $$props.motion && parseMotionProp($$props.motion, 'y'));
	const motionWidth = createMotion($$props.initialWidth ?? $$props.width, () => $$props.width, $$props.motion && parseMotionProp($$props.motion, 'width'));
	const motionHeight = createMotion($$props.initialHeight ?? $$props.height, () => $$props.height, $$props.motion && parseMotionProp($$props.motion, 'height'));
	const path = $.derived(() => `M${motionX.current},${motionY.current} h${motionWidth.current} v${motionHeight.current} h${-motionWidth.current} Z`);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let url = () => ($$arg0?.()).url;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ id: id(), url: url() }));
			$.append($$anchor, fragment_1);
		};

		$.component(node, () => $$props.ClipPath, ($$anchor, ClipPath_1) => {
			ClipPath_1($$anchor, {
				get id() {
					return id();
				},

				get disabled() {
					return disabled();
				},

				get invert() {
					return invert();
				},

				get path() {
					return $.get(path);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}