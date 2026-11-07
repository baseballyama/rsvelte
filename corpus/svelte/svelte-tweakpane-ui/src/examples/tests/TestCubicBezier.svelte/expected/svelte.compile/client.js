import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CubicBezier } from '$lib';

var root = $.from_html(`<!> <!> <hr/> <pre>Value: <span> </span></pre> <pre>Binding 1 Internal: <span> </span></pre> <pre>Binding 1 External: <span> </span></pre> <pre>Binding 2 Internal: <span> </span></pre> <pre>Binding 2 External: <span> </span></pre>`, 1);

export default function TestCubicBezier($$anchor) {
	let value = { x1: 0, y1: 0, x2: 0, y2: 0 };
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	CubicBezier(node, {
		label: 'Binding 1',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					binding1InternalEventCount++;
				} else {
					binding1ExternalEventCount++;
				}
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	CubicBezier(node_1, {
		label: 'Binding 2',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					binding2InternalEventCount++;
				} else {
					binding2ExternalEventCount++;
				}
			}
		}
	});

	var pre = $.sibling(node_1, 4);
	var span = $.sibling($.child(pre));
	var text = $.only_child(span, true);

	$.reset(pre);

	var pre_1 = $.sibling(pre, 2);
	var span_1 = $.sibling($.child(pre_1));
	var text_1 = $.only_child(span_1, true);

	$.reset(pre_1);

	var pre_2 = $.sibling(pre_1, 2);
	var span_2 = $.sibling($.child(pre_2));
	var text_2 = $.only_child(span_2, true);

	$.reset(pre_2);

	var pre_3 = $.sibling(pre_2, 2);
	var span_3 = $.sibling($.child(pre_3));
	var text_3 = $.only_child(span_3, true);

	$.reset(pre_3);

	var pre_4 = $.sibling(pre_3, 2);
	var span_4 = $.sibling($.child(pre_4));
	var text_4 = $.only_child(span_4, true);

	$.reset(pre_4);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, binding1InternalEventCount);
			$.set_text(text_2, binding1ExternalEventCount);
			$.set_text(text_3, binding2InternalEventCount);
			$.set_text(text_4, binding2ExternalEventCount);
		},
		[() => JSON.stringify(value, undefined, 2)]
	);

	$.append($$anchor, fragment);
}