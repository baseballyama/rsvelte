import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';
import Button from '@smui/button';

var root = $.from_html(`<!> <div><!></div> <pre class="status"> </pre>`, 1);

export default function _Range($$anchor) {
	let valueStart = $.state(1);
	let valueEnd = $.state(4);
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		range: true,
		min: 0,
		max: 10,
		step: 0.1,
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

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		onclick: () => {
			$.set(valueStart, 0);
			$.set(valueEnd, 10);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Maximum Range!');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Value: ${$.get(valueStart) ?? ''} - ${$.get(valueEnd) ?? ''}`));
	$.append($$anchor, fragment);
}