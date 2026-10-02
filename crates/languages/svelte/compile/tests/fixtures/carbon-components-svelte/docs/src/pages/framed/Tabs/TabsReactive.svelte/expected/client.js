import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, Tab, TabContent, Tabs } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div> <div><strong>Selected index:</strong> </div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function TabsReactive($$anchor) {
	let selected = 0;

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Tabs(node, {
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Tab(node_1, { label: 'Tab label 1' });

					var node_2 = $.sibling(node_1, 2);

					Tab(node_2, { label: 'Tab label 2' });

					var node_3 = $.sibling(node_2, 2);

					Tab(node_3, { label: 'Tab label 3' });
					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					content: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						TabContent(node_4, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Content 1');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						TabContent(node_5, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Content 2');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						TabContent(node_6, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Content 3');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					}
				}
			});

			var node_7 = $.sibling(node, 2);

			Stack(node_7, {
				gap: 4,
				orientation: 'horizontal',
				align: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var div = $.first_child(fragment_4);
					var node_8 = $.child(div);

					Button(node_8, {
						kind: 'tertiary',
						size: 'small',
						$$events: { click: () => selected = 1 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Set index to 1');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var text_4 = $.sibling($.child(div_1));

					$.reset(div_1);
					$.template_effect(() => $.set_text(text_4, ` ${selected ?? ''}`));
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}