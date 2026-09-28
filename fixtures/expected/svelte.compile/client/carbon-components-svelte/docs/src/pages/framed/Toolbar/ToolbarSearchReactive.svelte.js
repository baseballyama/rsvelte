import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	ButtonSet,
	Stack,
	Toolbar,
	ToolbarContent,
	ToolbarSearch
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div> <div><strong>Search value:</strong> </div>`, 1);

export default function ToolbarSearchReactive($$anchor) {
	let value = "";

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Toolbar(node, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							ToolbarSearch(node_1, {
								placeholder: 'Search...',
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
								}
							});

							var node_2 = $.sibling(node_1, 2);

							Button(node_2, {
								size: 'small',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Create');

									$.append($$anchor, text);
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

			var node_3 = $.sibling(node, 2);

			Stack(node_3, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var div = $.first_child(fragment_4);
					var node_4 = $.child(div);

					ButtonSet(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_5 = $.first_child(fragment_5);

							{
								let $0 = $.derived(() => value === "products");

								Button(node_5, {
									size: 'small',
									get disabled() {
										return $.get($0);
									},
									$$events: { click: () => value = "products" },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Set value');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => value.length === 0);

								Button(node_6, {
									kind: 'ghost',
									size: 'small',
									get disabled() {
										return $.get($0);
									},
									$$events: { click: () => value = "" },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Clear value');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var text_3 = $.sibling($.child(div_1));

					$.reset(div_1);
					$.template_effect(() => $.set_text(text_3, ` ${value ?? ''}`));
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}