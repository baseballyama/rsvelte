import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FloatingLayerArrow from "$lib/bits/utilities/floating-layer/components/floating-layer-arrow.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Tooltip_arrow($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	FloatingLayerArrow($$anchor, $.spread_props(() => restProps, {
		get ref() {
			return ref();
		},

		set ref($$value) {
			ref($$value);
		}
	}));

	$.pop();
}