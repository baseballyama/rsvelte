import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, SelectableTile, SelectableTileGroup, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <div>Selected: <strong> </strong></div> <!>`, 1);

export default function SelectableTileReactive($$anchor) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = [values[0], values[1]];

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SelectableTileGroup(node, {
				legendText: 'Service pricing tiers',
				name: 'plan',
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => values, $.index, ($$anchor, value) => {
						SelectableTile($$anchor, {
							get value() {
								return $.get(value);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(value)));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var strong = $.sibling($.child(div));
			var text_1 = $.only_child(strong, true);

			$.reset(div);

			var node_2 = $.sibling(div, 2);

			{
				let $0 = $.derived(() => selected.length === 1 && selected[0] === values[1]);

				Button(node_2, {
					size: 'small',
					get disabled() {
						return $.get($0);
					},
					$$events: { click: () => selected = [values[1]] },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, `Set to "${values[1] ?? ''}" only`));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			$.template_effect(($0) => $.set_text(text_1, $0), [() => selected.join(", ") || "None"]);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}