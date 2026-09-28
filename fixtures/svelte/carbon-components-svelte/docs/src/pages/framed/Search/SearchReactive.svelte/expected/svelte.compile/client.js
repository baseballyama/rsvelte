import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Search, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div> <div> </div>`, 1);

export default function SearchReactive($$anchor) {
	let value = "";

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Search(node, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			ButtonSet(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => value === "Cloud functions");

						Button(node_2, {
							size: 'small',
							get disabled() {
								return $.get($0);
							},
							$$events: { click: () => value = "Cloud functions" },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Set value');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => value.length === 0);

						Button(node_3, {
							kind: 'ghost',
							size: 'small',
							get disabled() {
								return $.get($0);
							},
							$$events: { click: () => value = "" },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Clear value');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var text_2 = $.only_child(div_1);

			$.template_effect(() => $.set_text(text_2, `Value: ${value ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}