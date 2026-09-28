import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'open']);

export default function Collapsible($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => CollapsiblePrimitive.Root, ($$anchor, CollapsiblePrimitive_Root) => {
		CollapsiblePrimitive_Root($$anchor, $.spread_props({ 'data-slot': 'collapsible' }, () => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}