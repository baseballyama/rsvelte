import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _MinRange($$anchor) {
	let valueStart = $.state(1);
	let valueEnd = $.state(4);
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		range: true,
		min: 0,
		max: 10,
		step: 0.1,
		minRange: 1,
		'input$aria-label': 'Min range slider',
		get start() {
			return $.get(valueStart);
		},

		set start($$value) {
			$.set(valueStart, $$value, true);
		},

		get end() {
			return $.get(valueEnd);
		},

		set end($$value) {
			$.set(valueEnd, $$value, true);
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Value: ${$.get(valueStart) ?? ''} - ${$.get(valueEnd) ?? ''}`));
	$.append($$anchor, fragment);
}