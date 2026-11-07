import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Stepper from "$lib/registry/ui/stepper/index.js";

export default function Checkout_steps($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Stepper.Root, ($$anchor, Stepper_Root) => {
		Stepper_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 16, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Stepper.Item, ($$anchor, Stepper_Item) => {
						Stepper_Item($$anchor, { step: i + 1 });
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}