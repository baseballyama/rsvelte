import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span>1</span>`);
var root_1 = $.from_html(`<p>Note how double clicking has no resizing effects..</p>`);
var root_2 = $.from_html(`<span>3</span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		horizontal: true,
		style: 'height: 400px',
		dblClickSplitter: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Pane(node, {
				size: 33,
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Pane(node_1, {
				size: 33,
				children: ($$anchor, $$slotProps) => {
					var p = root_1();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Pane(node_2, {
				size: 34,
				children: ($$anchor, $$slotProps) => {
					var span_1 = root_2();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}