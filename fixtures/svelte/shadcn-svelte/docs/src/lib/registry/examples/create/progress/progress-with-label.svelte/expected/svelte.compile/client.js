import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span>Upload progress</span> <span class="ml-auto">66%</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Progress_with_label($$anchor) {
	Example($$anchor, {
		title: 'With Label',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'progress-upload',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();

									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						Progress(node_2, { value: 66, class: 'w-full', id: 'progress-upload' });
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