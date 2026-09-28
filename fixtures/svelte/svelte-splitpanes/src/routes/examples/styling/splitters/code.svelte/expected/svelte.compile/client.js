import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span>1</span>`);
var root_1 = $.from_html(`<span>2</span>`);
var root_2 = $.from_html(`<span>3</span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

var root_4 = $.from_html(`<em class="specs"><p>In this example the splitters are thin lines but the reactive touch zone is spread to 30
        pixels all around!</p></em>`);

var root_5 = $.from_html(`<!> <!>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		theme: 'my-theme',
		horizontal: true,
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node = $.first_child(fragment_1);

			Pane(node, {
				children: ($$anchor, $$slotProps) => {
					Splitpanes($$anchor, {
						theme: 'my-theme',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_1 = $.first_child(fragment_3);

							Pane(node_1, {
								children: ($$anchor, $$slotProps) => {
									var span = root();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Pane(node_2, {
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_1();

									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Pane(node_3, {
								children: ($$anchor, $$slotProps) => {
									var span_2 = root_2();

									$.append($$anchor, span_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			Pane(node_4, {
				children: ($$anchor, $$slotProps) => {
					var em = root_4();

					$.append($$anchor, em);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}