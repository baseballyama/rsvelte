import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _DiscreteRange($$anchor) {
	let valueStart = $.state(4);
	let valueEnd = $.state(6);
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		range: true,
		min: 0,
		max: 10,
		step: 1,
		discrete: true,
		tickMarks: true,
		'input$aria-label': 'Range slider',
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