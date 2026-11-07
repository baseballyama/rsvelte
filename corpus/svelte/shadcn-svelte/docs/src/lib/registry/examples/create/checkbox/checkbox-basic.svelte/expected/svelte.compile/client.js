import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Checkbox_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					orientation: 'horizontal',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
							Checkbox_Root($$anchor, { id: 'terms' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'terms',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Accept terms and conditions');

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
}