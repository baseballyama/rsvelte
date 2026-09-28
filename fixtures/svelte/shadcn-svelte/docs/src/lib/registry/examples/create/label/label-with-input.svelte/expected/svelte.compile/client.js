import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Label_with_input($$anchor) {
	Example($$anchor, {
		title: 'With Input',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Label(node_1, {
							for: 'label-demo-username',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Username');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						Input(node_2, { id: 'label-demo-username', placeholder: 'Username' });
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