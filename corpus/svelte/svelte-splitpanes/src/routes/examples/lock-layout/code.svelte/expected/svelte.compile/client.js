import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span>1</span> <p>Try grabbing to very bottom splitter, note how it stops on the bounderies of this panel</p>`, 1);
var root_1 = $.from_html(`<span>2</span>`);
var root_2 = $.from_html(`<span>3</span>`);
var root_3 = $.from_html(`<span>4</span>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<span>5</span> <p>Try grabbing to very top splitter, note how it stops on the bounderies of this panel</p>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		horizontal: true,
		style: 'height: 400px',
		pushOtherPanes: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			Pane(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Pane(node_1, {
				children: ($$anchor, $$slotProps) => {
					Splitpanes($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_4();
							var node_2 = $.first_child(fragment_4);

							Pane(node_2, {
								children: ($$anchor, $$slotProps) => {
									var span = root_1();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Pane(node_3, {
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_2();

									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Pane(node_4, {
								children: ($$anchor, $$slotProps) => {
									var span_2 = root_3();

									$.append($$anchor, span_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			Pane(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_5();

					$.next(2);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}