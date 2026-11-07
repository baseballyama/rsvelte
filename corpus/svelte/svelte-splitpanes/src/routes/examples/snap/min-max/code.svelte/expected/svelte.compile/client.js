import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span style="font-size: 20px;">I have a snap size of 10% <br/> I have a min size of 10% <br/> I have a max size of 70%</span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Pane(node, {});

			var node_1 = $.sibling(node, 2);

			Pane(node_1, {
				snapSize: 10,
				minSize: 10,
				maxSize: 70,
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Pane(node_2, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}