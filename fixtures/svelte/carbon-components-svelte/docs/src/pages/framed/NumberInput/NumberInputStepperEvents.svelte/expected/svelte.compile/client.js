import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NumberInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<strong>click:stepper events:</strong> <pre> </pre>`, 1);
var root_1 = $.from_html(`<strong>blur events:</strong> <pre> </pre>`, 1);
var root_2 = $.from_html(`<strong>blur:stepper events:</strong> <pre> </pre>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function NumberInputStepperEvents($$anchor) {
	let value = 0;
	let clickStepperEvents = [];
	let blurEvents = [];
	let blurStepperEvents = [];

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			NumberInput(node, {
				labelText: 'Clusters',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$events: {
					'click:stepper': (e) => {
						clickStepperEvents = [
							...clickStepperEvents,
							`value: ${e.detail.value}, direction: ${e.detail.direction}`
						];
					},

					blur: (e) => {
						blurEvents = [...blurEvents, `value: ${e.detail.value}`];
					},

					'blur:stepper': (e) => {
						blurStepperEvents = [
							...blurStepperEvents,
							`value: ${e.detail.value}, direction: ${e.detail.direction}`
						];
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			Stack(node_1, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_2 = $.first_child(fragment_2);

					Stack(node_2, {
						gap: 2,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var pre = $.sibling($.first_child(fragment_3), 2);
							var text = $.only_child(pre, true);

							$.template_effect(($0) => $.set_text(text, $0), [() => clickStepperEvents.join("\n") || "(none)"]);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Stack(node_3, {
						gap: 2,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var pre_1 = $.sibling($.first_child(fragment_4), 2);
							var text_1 = $.only_child(pre_1, true);

							$.template_effect(($0) => $.set_text(text_1, $0), [() => blurEvents.join("\n") || "(none)"]);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Stack(node_4, {
						gap: 2,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var pre_2 = $.sibling($.first_child(fragment_5), 2);
							var text_2 = $.only_child(pre_2, true);

							$.template_effect(($0) => $.set_text(text_2, $0), [() => blurStepperEvents.join("\n") || "(none)"]);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}