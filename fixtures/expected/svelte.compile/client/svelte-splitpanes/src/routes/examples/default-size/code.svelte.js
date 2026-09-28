import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span>1</span> <p>Default size of 65%</p>`, 1);
var root_1 = $.from_html(`<span>2</span> <p>Default size of 10%</p>`, 1);
var root_2 = $.from_html(`<span>3</span> <p>Default size of 25%</p>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		horizontal: true,
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Pane(node, {
				size: 65,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Pane(node_1, {
				size: 10,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();

					$.next(2);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Pane(node_2, {
				size: 25,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();

					$.next(2);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}