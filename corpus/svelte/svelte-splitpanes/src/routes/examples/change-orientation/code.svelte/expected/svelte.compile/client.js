import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import Button from '$comp/Button.svelte';

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Code($$anchor) {
	let horizontal = false;
	let firstSplitter = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: {
			click: () => {
				horizontal = !horizontal;
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, horizontal ? 'Turn to Vertical' : 'Turn to Horizontal'));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		$$events: {
			click: () => {
				firstSplitter = !firstSplitter;
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, firstSplitter ? 'Hide first splitter' : 'Show first Splitter'));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Splitpanes(node_2, {
		style: 'height: 400px',
		get firstSplitter() {
			return firstSplitter;
		},

		get horizontal() {
			return horizontal;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.each(node_3, 16, () => ({ length: 3 }), $.index, ($$anchor, _, i) => {
				Pane($$anchor, {
					minSize: 5,
					children: ($$anchor, $$slotProps) => {
						var span = root();

						span.textContent = i + 1;
						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}