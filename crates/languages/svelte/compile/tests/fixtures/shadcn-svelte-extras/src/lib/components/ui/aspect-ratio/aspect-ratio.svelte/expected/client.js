import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AspectRatio as AspectRatioPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Aspect_ratio($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AspectRatioPrimitive.Root, ($$anchor, AspectRatioPrimitive_Root) => {
		AspectRatioPrimitive_Root($$anchor, $.spread_props({ 'data-slot': 'aspect-ratio' }, () => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}