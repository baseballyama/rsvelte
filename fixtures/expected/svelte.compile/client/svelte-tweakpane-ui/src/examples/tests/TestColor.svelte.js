import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Color } from '$lib';

var root = $.from_html(`<!> <!> <!> <!> <hr/> <pre>Value Object: <span> </span></pre> <pre>Binding 1 Internal: <span> </span></pre> <pre>Binding 1 External: <span> </span></pre> <pre>Binding 2 Internal: <span> </span></pre> <pre>Binding 2 External: <span> </span></pre> <pre>Value Tuple: <span> </span></pre> <pre>Binding 3 Internal: <span> </span></pre> <pre>Binding 3 External: <span> </span></pre> <pre>Binding 4 Internal: <span> </span></pre> <pre>Binding 5 External: <span> </span></pre>`, 1);

export default function TestColor($$anchor) {
	let value = { r: 0, g: 0, b: 0 };
	let value2 = [0, 0, 0, 0];
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let binding3InternalEventCount = 0;
	let binding3ExternalEventCount = 0;
	let binding4InternalEventCount = 0;
	let binding4ExternalEventCount = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	Color(node, {
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

	Color(node_1, {
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

	var node_2 = $.sibling(node_1, 2);

	Color(node_2, {
		label: 'Binding 3',
		get value() {
			return value2;
		},

		set value($$value) {
			value2 = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					binding3InternalEventCount++;
				} else {
					binding3ExternalEventCount++;
				}
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Color(node_3, {
		label: 'Binding 4',
		get value() {
			return value2;
		},

		set value($$value) {
			value2 = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					binding4InternalEventCount++;
				} else {
					binding4ExternalEventCount++;
				}
			}
		}
	});

	var pre = $.sibling(node_3, 4);
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

	var pre_5 = $.sibling(pre_4, 2);
	var span_5 = $.sibling($.child(pre_5));
	var text_5 = $.only_child(span_5, true);

	$.reset(pre_5);

	var pre_6 = $.sibling(pre_5, 2);
	var span_6 = $.sibling($.child(pre_6));
	var text_6 = $.only_child(span_6, true);

	$.reset(pre_6);

	var pre_7 = $.sibling(pre_6, 2);
	var span_7 = $.sibling($.child(pre_7));
	var text_7 = $.only_child(span_7, true);

	$.reset(pre_7);

	var pre_8 = $.sibling(pre_7, 2);
	var span_8 = $.sibling($.child(pre_8));
	var text_8 = $.only_child(span_8, true);

	$.reset(pre_8);

	var pre_9 = $.sibling(pre_8, 2);
	var span_9 = $.sibling($.child(pre_9));
	var text_9 = $.only_child(span_9, true);

	$.reset(pre_9);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, binding1InternalEventCount);
			$.set_text(text_2, binding1ExternalEventCount);
			$.set_text(text_3, binding2InternalEventCount);
			$.set_text(text_4, binding2ExternalEventCount);
			$.set_text(text_5, $1);
			$.set_text(text_6, binding3InternalEventCount);
			$.set_text(text_7, binding3ExternalEventCount);
			$.set_text(text_8, binding4InternalEventCount);
			$.set_text(text_9, binding4ExternalEventCount);
		},
		[
			() => JSON.stringify(value, undefined, 2),
			() => JSON.stringify(value2, undefined, 2)
		]
	);

	$.append($$anchor, fragment);
}