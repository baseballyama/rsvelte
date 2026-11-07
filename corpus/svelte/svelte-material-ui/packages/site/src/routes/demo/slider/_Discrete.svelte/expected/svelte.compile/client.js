import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Discrete($$anchor) {
	let value = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		min: -10,
		max: 10,
		step: 2,
		discrete: true,
		'input$aria-label': 'Discrete slider',
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