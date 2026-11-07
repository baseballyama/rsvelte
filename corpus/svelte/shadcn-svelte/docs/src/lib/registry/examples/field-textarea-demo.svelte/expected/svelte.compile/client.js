import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_textarea_demo($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
		Field_Set($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Group, ($$anchor, Field_Group) => {
					Field_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
											Field_Label($$anchor, {
												for: 'feedback',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Feedback');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										Textarea(node_4, {
											id: 'feedback',
											placeholder: 'Your feedback helps us improve...',
											rows: 4
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Field.Description, ($$anchor, Field_Description) => {
											Field_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Share your thoughts about our service.');

													$.append($$anchor, text_1);
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}