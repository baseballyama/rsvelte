import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'pathId',
	'objectId',
	'duration',
	'repeatCount',
	'fill',
	'rotate',
	'ref',
	'children'
]);

var root = $.from_svg(`<defs><animateMotion><mpath></mpath></animateMotion></defs><!>`, 1);

export default function MotionPath($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let pathId = $.prop($$props, 'pathId', 19, () => createId('motionPathId-', uid)),
		objectId = $.prop($$props, 'objectId', 19, () => createId('motionObjectId-', uid)),
		fill = $.prop($$props, 'fill', 3, 'freeze'),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	// TODO: Investigate `calcMode:spline`, `keyTimes`, and `keySplines` to work with `svelte/easing`
	// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/calcMode
	// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keyTimes
	// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keySplines
	// https://medium.com/javarevisited/animate-your-scalable-vector-graphics-svg-56f5800cd34b
	// Restart animation anytime the component is remounted (otherwise it only ever plays once)
	$.user_effect(() => {
		if (!$.get(ref)) return;

		$.get(ref).beginElement();
	});

	var fragment = root();
	var defs = $.first_child(fragment);
	var animateMotion = $.child(defs);

	$.attribute_effect(
		animateMotion,
		($0) => ({
			href: `#${objectId() ?? ''}`,
			dur: $$props.duration,
			repeatCount: $$props.repeatCount,
			fill: fill(),
			rotate: $$props.rotate,
			...$0
		}),
		[() => extractLayerProps(restProps, 'lc-motion-path')]
	);

	var mpath = $.only_child(animateMotion);

	$.bind_this(animateMotion, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.reset(defs);

	var node = $.sibling(defs);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ pathId: pathId(), objectId: objectId() }));
	$.template_effect(() => $.set_attribute(mpath, 'href', `#${pathId() ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}