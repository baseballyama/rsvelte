import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_group_text_alignment($$anchor) {
	Example($$anchor, {
		title: 'Text Alignment',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						Label(node_1, {
							id: 'alignment-label',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Text Alignment');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						ButtonGroup(node_2, {
							'aria-labelledby': 'alignment-label',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								Button(node_3, {
									variant: 'outline',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Left');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								Button(node_4, {
									variant: 'outline',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Center');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								Button(node_5, {
									variant: 'outline',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Right');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								Button(node_6, {
									variant: 'outline',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Justify');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
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