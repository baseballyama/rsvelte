import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Text } from '$lib';

var root = $.from_html(`<!> <!> <!> <pre>Value: <span> </span></pre> <pre>Live: <span> </span></pre> <pre>Binding 1 Internal: <span> </span></pre> <pre>Binding 1 External: <span> </span></pre> <pre>Binding 2 Internal: <span> </span></pre> <pre>Binding 2 External: <span> </span></pre>`, 1);

export default function TestText($$anchor) {
	let text = 'Cosmic Manifold';
	let live = true;
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		label: 'Live',
		get value() {
			return live;
		},

		set value($$value) {
			live = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Text(node_1, {
		label: 'The Message',
		get live() {
			return live;
		},

		get value() {
			return text;
		},

		set value($$value) {
			text = $$value;
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

	var node_2 = $.sibling(node_1, 2);

	Text(node_2, {
		label: 'The Message',
		get live() {
			return live;
		},

		get value() {
			return text;
		},

		set value($$value) {
			text = $$value;
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

	var pre = $.sibling(node_2, 2);
	var span = $.sibling($.child(pre));
	var text_1 = $.only_child(span, true);

	$.reset(pre);

	var pre_1 = $.sibling(pre, 2);
	var span_1 = $.sibling($.child(pre_1));
	var text_2 = $.only_child(span_1, true);

	$.reset(pre_1);

	var pre_2 = $.sibling(pre_1, 2);
	var span_2 = $.sibling($.child(pre_2));
	var text_3 = $.only_child(span_2, true);

	$.reset(pre_2);

	var pre_3 = $.sibling(pre_2, 2);
	var span_3 = $.sibling($.child(pre_3));
	var text_4 = $.only_child(span_3, true);

	$.reset(pre_3);

	var pre_4 = $.sibling(pre_3, 2);
	var span_4 = $.sibling($.child(pre_4));
	var text_5 = $.only_child(span_4, true);

	$.reset(pre_4);

	var pre_5 = $.sibling(pre_4, 2);
	var span_5 = $.sibling($.child(pre_5));
	var text_6 = $.only_child(span_5, true);

	$.reset(pre_5);

	$.template_effect(() => {
		$.set_text(text_1, text);
		$.set_text(text_2, live);
		$.set_text(text_3, binding1InternalEventCount);
		$.set_text(text_4, binding1ExternalEventCount);
		$.set_text(text_5, binding2InternalEventCount);
		$.set_text(text_6, binding2ExternalEventCount);
	});

	$.append($$anchor, fragment);
}