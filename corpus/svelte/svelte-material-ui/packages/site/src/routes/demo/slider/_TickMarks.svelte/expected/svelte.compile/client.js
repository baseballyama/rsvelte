import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _TickMarks($$anchor) {
	let value = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		min: -100,
		max: 100,
		step: 5,
		discrete: true,
		tickMarks: true,
		'input$aria-label': 'Tick mark slider',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Value: ${$.get(value) ?? ''}`));
	$.append($$anchor, fragment);
}