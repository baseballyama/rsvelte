import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Image } from '$lib';

var root = $.from_html(`<!> <!> <!> <pre>Value: <span> </span></pre> <pre>Binding 1 Internal: <span> </span></pre> <pre>Binding 1 External: <span> </span></pre> <pre>Binding 2 Internal: <span> </span></pre> <pre>Binding 2 External: <span> </span></pre>`, 1);

export default function TestImage($$anchor) {
	let source = 'placeholder';

	async function getRandomKittenUrl() {
		const { url } = await fetch('https://loremflickr.com/800/800/kitten', { method: 'HEAD' });

		return url;
	}

	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		label: 'Random Placeholder',
		title: 'Load Cat',
		$$events: {
			click: async () => {
				source = await getRandomKittenUrl();
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Image(node_1, {
		fit: 'contain',
		label: 'Image 1',
		get value() {
			return source;
		},

		set value($$value) {
			source = $$value;
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

	Image(node_2, {
		fit: 'contain',
		label: 'Image 2',
		get value() {
			return source;
		},

		set value($$value) {
			source = $$value;
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

	$.template_effect(() => {
		$.set_text(text, source);
		$.set_text(text_1, binding1InternalEventCount);
		$.set_text(text_2, binding1ExternalEventCount);
		$.set_text(text_3, binding2InternalEventCount);
		$.set_text(text_4, binding2ExternalEventCount);
	});

	$.append($$anchor, fragment);
}