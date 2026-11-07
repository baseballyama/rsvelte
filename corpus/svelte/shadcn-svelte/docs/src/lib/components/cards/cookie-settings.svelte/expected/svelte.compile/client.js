import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Cookie_settings($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Cookie Settings');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Manage your cookie settings here.');

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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'grid gap-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Content, ($$anchor, Field_Content) => {
											Field_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'necessary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Strictly Necessary');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('These cookies are essential in order to use the website and use its features.');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										Switch(node_9, { id: 'necessary', checked: true, 'aria-label': 'Necessary' });
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_5, 2);

							$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
								Field_Field_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Save preferences');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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