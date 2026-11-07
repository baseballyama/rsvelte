import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Field_checkbox($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Field.Label, ($$anchor, Field_Label) => {
		Field_Label($$anchor, {
			for: 'checkbox-demo',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
					Field_Field($$anchor, {
						orientation: 'horizontal',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Checkbox(node_2, { id: 'checkbox-demo', checked: true });

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Field.Label, ($$anchor, Field_Label_1) => {
								Field_Label_1($$anchor, {
									for: 'checkbox-demo',
									class: 'line-clamp-1',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('I agree to the terms and conditions');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
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