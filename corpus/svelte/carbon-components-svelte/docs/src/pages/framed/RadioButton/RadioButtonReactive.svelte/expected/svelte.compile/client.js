import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, RadioButton, RadioButtonGroup, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div></div> <div>Selected plan: <strong> </strong></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function RadioButtonReactive($$anchor) {
	const plans = ["Free (1 GB)", "Standard (10 GB)", "Pro (128 GB)"];
	let plan = plans[1];

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			RadioButtonGroup(node, {
				legendText: 'Storage tier (disk)',
				name: 'plan',
				get selected() {
					return plan;
				},

				set selected($$value) {
					plan = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 16, () => plans, (value) => value, ($$anchor, value) => {
						RadioButton($$anchor, {
							get labelText() {
								return value;
							},

							get value() {
								return value;
							}
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Stack(node_2, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var div = $.first_child(fragment_4);

					$.each(div, 20, () => plans, (value) => value, ($$anchor, value) => {
						{
							let $0 = $.derived(() => plan === value);

							Button($$anchor, {
								size: 'small',
								kind: 'secondary',
								get disabled() {
									return $.get($0);
								},
								$$events: { click: () => plan = value },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, `Select "${value ?? ''}"`));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						}
					});

					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var strong = $.sibling($.child(div_1));
					var text_1 = $.only_child(strong, true);

					$.reset(div_1);
					$.template_effect(() => $.set_text(text_1, plan));
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}