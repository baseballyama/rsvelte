import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NumberField from '$lib/components/ui/number-field';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Number_field($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => NumberField.Root, ($$anchor, NumberField_Root) => {
		NumberField_Root($$anchor, {
			min: -1000,
			max: 1000,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => NumberField.Group, ($$anchor, NumberField_Group) => {
					NumberField_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => NumberField.Decrement, ($$anchor, NumberField_Decrement) => {
								NumberField_Decrement($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => NumberField.Input, ($$anchor, NumberField_Input) => {
								NumberField_Input($$anchor, {});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => NumberField.Increment, ($$anchor, NumberField_Increment) => {
								NumberField_Increment($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}