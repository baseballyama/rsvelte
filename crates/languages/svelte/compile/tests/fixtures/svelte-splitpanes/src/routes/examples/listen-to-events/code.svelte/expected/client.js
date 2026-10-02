import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import TextArea from '$comp/TextAreaAutosize.svelte';

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<!> <p>Try resizing panes and check the logs bellow.</p> <!>`, 1);

export default function Code($$anchor) {
	let val = '// Event name: Event params   (Last event at the top)';

	function handleMessage(event) {
		if (event.detail) val = event.type + ' ' + JSON.stringify(event.detail) + '\n' + val; else val = event.type + '\n' + val;
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	Splitpanes(node, {
		style: 'height: 400px',
		$$events: {
			ready: handleMessage,
			resize: handleMessage,
			resized: handleMessage,
			'pane-click': handleMessage,
			'pane-maximize': handleMessage,
			'pane-add': handleMessage,
			'pane-remove': handleMessage,
			'splitter-click': handleMessage
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 16, () => ({ length: 3 }), $.index, ($$anchor, _, i) => {
				Pane($$anchor, {
					minSize: 10,
					children: ($$anchor, $$slotProps) => {
						var span = root();

						span.textContent = i + 1;
						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	TextArea(node_2, {
		minRows: 4,
		maxRows: 40,
		get value() {
			return val;
		},

		set value($$value) {
			val = $$value;
		}
	});

	$.append($$anchor, fragment);
}