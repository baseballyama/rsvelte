import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span>1</span>`);
var root_1 = $.from_html(`<span>2</span>`);
var root_2 = $.from_html(`<span>3</span>`);
var root_3 = $.from_html(`<span>4</span>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	Splitpanes($$anchor, {
		id: 'mysplitpane',
		horizontal: true,
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			Pane(node, {
				size: 65,
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Pane(node_1, {
				size: 10,
				children: ($$anchor, $$slotProps) => {
					var span_1 = root_1();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Pane(node_2, {
				children: ($$anchor, $$slotProps) => {
					var span_2 = root_2();

					$.append($$anchor, span_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Pane(node_3, {
				children: ($$anchor, $$slotProps) => {
					var span_3 = root_3();

					$.append($$anchor, span_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}